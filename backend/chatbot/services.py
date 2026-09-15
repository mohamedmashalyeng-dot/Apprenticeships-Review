"""AI concierge that helps visitors find apprenticeship training providers.

Routed through OpenRouter's OpenAI-compatible chat-completions API (not the Anthropic
SDK — this deployment authenticates with an OpenRouter key, not a first-party Anthropic
key), calling a Claude model on the other end. Every provider the assistant names comes
from `search_providers`, which queries the platform's own database — the model is never
allowed to invent a provider.
"""
import json

import requests
from django.conf import settings
from django.db.models import Q

from catalog.models import Company

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "anthropic/claude-opus-5"
# Chat replies are a few sentences, not essays — capping this keeps each call cheap and
# also keeps it working on a near-empty OpenRouter balance (an uncapped request defaults
# to the model's full 64K+ output ceiling, which a low balance can't cover and OpenRouter
# rejects outright with a 402 before any tokens are generated).
MAX_TOKENS = 1024
REQUEST_TIMEOUT = 60
MAX_TOOL_ITERATIONS = 4
RESULTS_LIMIT = 5

SYSTEM_PROMPT = """You are the AI concierge for ApprenticeshipsReviews, a platform where \
people research and review UK apprenticeship training providers, colleges, and employers.

Your job is to help visitors find providers that fit what they're looking for, using the \
`search_providers` tool. Never name or describe a specific provider unless it came back from \
that tool — you have no other source of truth about which providers exist or how good they are.

Guidelines:
- If the visitor's request already gives you something to search on (a subject, sector, \
location, or level), call the tool right away with your best interpretation — don't \
interrogate them with clarifying questions first.
- Only ask a short clarifying question when the request is too vague to search at all \
(e.g. just "hi" or "help me").
- After you get results, reply in a few warm, concise sentences that reference the top \
matches by name and say what makes them a fit (rating, location, sector). If the tool \
returns nothing, say so honestly and suggest broadening the search (a different location \
or level) instead of guessing.
- Stay on topic: apprenticeships, training providers, and this platform. Politely decline \
anything unrelated.
- Keep replies short — this is a chat widget, not an essay."""

SEARCH_PROVIDERS_TOOL = {
    "type": "function",
    "function": {
        "name": "search_providers",
        "description": (
            "Search the platform's database of apprenticeship training providers. Returns real "
            "providers matching the given criteria, each with location, rating, review count, "
            "delivered apprenticeship standards, and strengths. Always use this before naming a "
            "provider — never invent one. Omit any field you have no evidence for."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "sector": {
                    "type": "string",
                    "description": (
                        "Subject/sector/occupation keyword, e.g. 'software development', "
                        "'engineering', 'health and social care'."
                    ),
                },
                "level": {
                    "type": "integer",
                    "description": "Apprenticeship level, e.g. 3 for Level 3, 6 or 7 for a degree apprenticeship.",
                },
                "location": {
                    "type": "string",
                    "description": "City or region the visitor wants, e.g. 'London', 'Manchester'.",
                },
                "min_rating": {
                    "type": "number",
                    "description": "Minimum average rating out of 5 — only set this when the visitor asks for highly-rated providers.",
                },
                "keywords": {
                    "type": "string",
                    "description": "Free-text keywords to match against a provider's name or description, for anything the other fields don't cover.",
                },
            },
            "required": [],
        },
    },
}


class ChatbotUpstreamError(Exception):
    """Raised when OpenRouter can't be reached or returns an error status."""


def search_providers(sector=None, level=None, location=None, min_rating=None, keywords=None):
    qs = Company.objects.filter(status=Company.Status.ACTIVE)

    if location:
        qs = qs.filter(location__icontains=location)
    if min_rating is not None:
        qs = qs.filter(average_rating__gte=min_rating)

    # Combined into one Q so sector and level are matched against the *same* joined
    # Standard row (two separate .filter() calls would each open their own join, so a
    # provider could match on an unrelated standard for each half).
    standard_filters = []
    if sector:
        standard_filters.append(
            Q(standards__sector__icontains=sector) | Q(standards__standard_name__icontains=sector)
        )
    if level is not None:
        standard_filters.append(Q(standards__level=level))
    if standard_filters:
        combined = standard_filters[0]
        for extra in standard_filters[1:]:
            combined &= extra
        qs = qs.filter(combined)

    if keywords:
        qs = qs.filter(Q(trading_name__icontains=keywords) | Q(description__icontains=keywords))

    qs = qs.distinct().order_by("-average_rating", "-total_reviews")[:RESULTS_LIMIT]

    results = []
    for company in qs:
        standard_names = list(company.standards.values_list("standard_name", flat=True).distinct()[:6])
        results.append(
            {
                "provider_id": company.slug,
                "name": company.trading_name,
                "location": company.location,
                "provider_type": company.company_type,
                "average_rating": float(company.average_rating),
                "total_reviews": company.total_reviews,
                "strengths": company.strengths[:5],
                "best_for": company.best_for[:5],
                "standards_delivered": standard_names,
                "description": company.description[:400],
            }
        )
    return results


def _call_openrouter(messages):
    try:
        response = requests.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL,
                "messages": messages,
                "tools": [SEARCH_PROVIDERS_TOOL],
                "max_tokens": MAX_TOKENS,
            },
            timeout=REQUEST_TIMEOUT,
        )
    except requests.RequestException as exc:
        raise ChatbotUpstreamError(f"Could not reach OpenRouter: {exc}") from exc

    if response.status_code != 200:
        raise ChatbotUpstreamError(f"OpenRouter returned {response.status_code}: {response.text[:500]}")

    data = response.json()
    try:
        return data["choices"][0]
    except (KeyError, IndexError) as exc:
        raise ChatbotUpstreamError(f"Unexpected OpenRouter response shape: {data}") from exc


def run_chat(history, user_message):
    """Run one turn of the concierge conversation.

    `history` is a list of {"role": "user"|"assistant", "content": str} from prior turns
    (plain text only — tool calls stay internal to each turn and aren't replayed). Returns
    {"reply": str, "providers": [...]} where `providers` is every provider the tool
    surfaced this turn, deduplicated, for the frontend to render as cards.
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += [{"role": turn["role"], "content": turn["content"]} for turn in history]
    messages.append({"role": "user", "content": user_message})

    matched_providers = {}
    message = {}

    for _ in range(MAX_TOOL_ITERATIONS):
        choice = _call_openrouter(messages)
        message = choice["message"]

        if choice.get("finish_reason") != "tool_calls" or not message.get("tool_calls"):
            break

        messages.append(message)
        for call in message["tool_calls"]:
            if call["function"]["name"] == "search_providers":
                try:
                    args = json.loads(call["function"]["arguments"] or "{}")
                except json.JSONDecodeError:
                    args = {}
                results = search_providers(**args)
                for result in results:
                    matched_providers[result["provider_id"]] = result
                tool_content = json.dumps(results)
            else:
                tool_content = f"Unknown tool: {call['function']['name']}"
            messages.append({"role": "tool", "tool_call_id": call["id"], "content": tool_content})

    reply_text = (message.get("content") or "").strip()
    if not reply_text:
        reply_text = "Sorry, I couldn't put together a good answer for that — could you rephrase your question?"

    return {"reply": reply_text, "providers": list(matched_providers.values())}
