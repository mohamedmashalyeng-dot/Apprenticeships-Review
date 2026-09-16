"""AI concierge that helps visitors find apprenticeship training providers.

Routed through Google's Gemini Interactions API (raw HTTP — no Anthropic SDK, no
OpenRouter; this deployment authenticates with a Gemini/AI Studio key). Every provider
the assistant names comes from `search_providers`, which queries the platform's own
database — the model is never allowed to invent a provider.

Unlike a typical stateless chat-completions API, the Interactions API is stateful on
Google's side: each call returns an `id`, and passing that back as
`previous_interaction_id` on the next call carries the full conversation forward without
resending any history — so this module (and the API contract in views.py) tracks an
`interaction_id` instead of a client-side transcript.
"""
import json

import requests
from django.conf import settings
from django.db.models import Q

from catalog.models import Company

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/interactions"
# Pinned to a specific dated release rather than the "-latest" alias: that alias currently
# resolves to a newer preview-tier model whose free-tier quota is only 20 requests/minute
# and was getting exhausted during normal use. gemini-2.5-flash (the previous pin) 404s for
# this project ("no longer available to new users") — its own error response names
# gemini-3.6-flash as the direct replacement, confirmed working below.
MODEL = "gemini-3.6-flash"
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
}


class ChatbotUpstreamError(Exception):
    """Raised when Gemini can't be reached or returns an error status."""


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


def _call_gemini(payload):
    try:
        response = requests.post(
            GEMINI_URL,
            headers={
                "x-goog-api-key": settings.GEMINI_API_KEY,
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=REQUEST_TIMEOUT,
        )
    except requests.RequestException as exc:
        raise ChatbotUpstreamError(f"Could not reach Gemini: {exc}") from exc

    if response.status_code != 200:
        raise ChatbotUpstreamError(f"Gemini returned {response.status_code}: {response.text[:500]}")

    return response.json()


def run_chat(previous_interaction_id, user_message):
    """Run one turn of the concierge conversation.

    `previous_interaction_id` (or None for a fresh conversation) is the `interaction_id`
    this function returned last turn — Gemini uses it to recall the conversation so far,
    so nothing else needs to be resent. Returns {"reply": str, "providers": [...],
    "interaction_id": str} where `providers` is every provider the tool surfaced this
    turn, deduplicated, and `interaction_id` should be passed back in on the next turn.
    """
    matched_providers = {}
    interaction_id = previous_interaction_id
    next_input = user_message
    data = {}

    for _ in range(MAX_TOOL_ITERATIONS):
        payload = {
            "model": MODEL,
            "system_instruction": SYSTEM_PROMPT,
            "tools": [SEARCH_PROVIDERS_TOOL],
            "generation_config": {"thinking_level": "low"},
            "input": next_input,
        }
        if interaction_id:
            payload["previous_interaction_id"] = interaction_id

        data = _call_gemini(payload)
        interaction_id = data.get("id") or interaction_id

        if data.get("status") != "requires_action":
            break

        function_calls = [step for step in data.get("steps", []) if step.get("type") == "function_call"]
        if not function_calls:
            break

        function_results = []
        for call in function_calls:
            if call.get("name") == "search_providers":
                results = search_providers(**(call.get("arguments") or {}))
                for result in results:
                    matched_providers[result["provider_id"]] = result
                result_value = json.dumps(results)
            else:
                result_value = f"Unknown tool: {call.get('name')}"
            function_results.append(
                {
                    "type": "function_result",
                    "name": call.get("name"),
                    "call_id": call.get("id"),
                    "result": result_value,
                }
            )
        next_input = function_results

    reply_text = "".join(
        part.get("text", "")
        for step in data.get("steps", [])
        if step.get("type") == "model_output"
        for part in step.get("content", [])
        if part.get("type") == "text"
    ).strip()
    if not reply_text:
        reply_text = "Sorry, I couldn't put together a good answer for that — could you rephrase your question?"

    return {
        "reply": reply_text,
        "providers": list(matched_providers.values()),
        "interaction_id": interaction_id,
    }
