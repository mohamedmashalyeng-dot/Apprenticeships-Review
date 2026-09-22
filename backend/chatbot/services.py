"""AI concierge that helps visitors find apprenticeship training providers.

Routed through OpenAI's Responses API over raw HTTP. Every provider the assistant names
comes from `search_providers`, which queries the platform's own database; the model is
never allowed to invent a provider.

The frontend still calls the opaque value `interaction_id`, but it is now the previous
OpenAI response id. Passing it back as `previous_response_id` lets OpenAI carry the
conversation forward without the browser resending the whole transcript.
"""

import json

import requests
from django.conf import settings
from django.db.models import Count, Q

from catalog.models import Company, Standard

OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
REQUEST_TIMEOUT = 60
MAX_TOOL_ITERATIONS = 4
RESULTS_LIMIT = 5
TOOL_ARGUMENT_KEYS = {
    "search_providers": {"sector", "level", "location", "min_rating", "keywords"},
    "get_provider_details": {"provider_id", "provider_name"},
    "search_standards": {"query", "sector", "level"},
    "compare_providers": {"provider_ids"},
}

SYSTEM_PROMPT = """You are the AI concierge for ApprenticeshipsReviews, a platform where \
people research and review UK apprenticeship training providers, colleges, and employers.

Your job is to help visitors find providers and apprenticeship standards that fit what \
they're looking for, using the available tools. Never name or describe a specific provider \
unless it came back from a tool - you have no other source of truth about which providers \
exist or how good they are.

Guidelines:
- Reply in the same language as the visitor. If they write Arabic, use natural, friendly \
Arabic. If they write English, use English.
- If the visitor's request already gives you something to search on (a subject, sector, \
location, or level), call the tool right away with your best interpretation - don't \
interrogate them with clarifying questions first.
- Only ask a short clarifying question when the request is too vague to search at all \
(e.g. just "hi" or "help me").
- Use `search_standards` for questions about apprenticeship subjects, levels, duration, \
funding, or "what programme should I choose".
- Use `get_provider_details` when the visitor asks about one provider by name, wants a \
website/location/rating summary, or asks whether that provider offers a standard.
- Use `compare_providers` when the visitor asks to compare two or more providers.
- After you get results, reply in a few warm, concise sentences that reference the top \
matches by name and say what makes them a fit (rating, review count, location, sector, \
standards). If a tool returns nothing, say so honestly and suggest broadening the search \
(a different keyword, location, or level) instead of guessing.
- Mention provider profile paths only when useful, e.g. `/provider/example-slug`.
- Stay on topic: apprenticeships, training providers, and this platform. Politely decline \
anything unrelated.
- Keep replies short - this is a chat widget, not an essay."""

SEARCH_PROVIDERS_TOOL = {
    "type": "function",
    "name": "search_providers",
    "description": (
        "Search the platform's database of apprenticeship training providers. Returns real "
        "providers matching the given criteria, each with location, rating, review count, "
        "delivered apprenticeship standards, and strengths. Always use this before naming a "
        "provider - never invent one. Omit any field you have no evidence for."
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
                "description": "Minimum average rating out of 5 - only set this when the visitor asks for highly-rated providers.",
            },
            "keywords": {
                "type": "string",
                "description": "Free-text keywords to match against a provider's name or description, for anything the other fields don't cover.",
            },
        },
        "required": [],
    },
}

GET_PROVIDER_DETAILS_TOOL = {
    "type": "function",
    "name": "get_provider_details",
    "description": (
        "Fetch a detailed profile for one real active provider by provider_id/slug or name. "
        "Use this before answering questions about a specific provider."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "provider_id": {
                "type": "string",
                "description": "Provider slug, e.g. 'example-training-provider'.",
            },
            "provider_name": {
                "type": "string",
                "description": "Provider trading name or partial name if the slug is unknown.",
            },
        },
        "required": [],
    },
}

SEARCH_STANDARDS_TOOL = {
    "type": "function",
    "name": "search_standards",
    "description": (
        "Search apprenticeship standards by keyword, sector, or level. Returns real standards "
        "from the platform database, including provider counts when available."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Subject, job role, or keyword, e.g. 'software', 'marketing', 'project manager'.",
            },
            "sector": {
                "type": "string",
                "description": "Sector keyword, e.g. 'digital', 'business', 'health'.",
            },
            "level": {
                "type": "integer",
                "description": "Apprenticeship level, e.g. 3, 4, 6, or 7.",
            },
        },
        "required": [],
    },
}

COMPARE_PROVIDERS_TOOL = {
    "type": "function",
    "name": "compare_providers",
    "description": (
        "Compare two or more active providers by slug/name. Returns rating, review count, "
        "location, provider type, and top standards for each matched provider."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "provider_ids": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Provider slugs or names to compare.",
            },
        },
        "required": ["provider_ids"],
    },
}

CHATBOT_TOOLS = [
    SEARCH_PROVIDERS_TOOL,
    GET_PROVIDER_DETAILS_TOOL,
    SEARCH_STANDARDS_TOOL,
    COMPARE_PROVIDERS_TOOL,
]


class ChatbotUpstreamError(Exception):
    """Raised when OpenAI can't be reached or returns an error status."""


def search_providers(sector=None, level=None, location=None, min_rating=None, keywords=None):
    qs = Company.objects.filter(status=Company.Status.ACTIVE)

    if location:
        qs = qs.filter(location__icontains=location)
    if min_rating is not None:
        qs = qs.filter(average_rating__gte=min_rating)

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
        results.append(_provider_summary(company))
    return results


def _provider_summary(company, description_limit=400):
    standard_names = list(company.standards.values_list("standard_name", flat=True).distinct()[:6])
    return {
        "provider_id": company.slug,
        "profile_path": f"/provider/{company.slug}",
        "name": company.trading_name,
        "location": company.location,
        "provider_type": company.company_type,
        "average_rating": float(company.average_rating),
        "total_reviews": company.total_reviews,
        "strengths": company.strengths[:5],
        "best_for": company.best_for[:5],
        "standards_delivered": standard_names,
        "description": company.description[:description_limit],
    }


def get_provider_details(provider_id=None, provider_name=None):
    qs = Company.objects.filter(status=Company.Status.ACTIVE).prefetch_related("standards")
    company = None
    if provider_id:
        company = qs.filter(slug=provider_id).first()
    if company is None and provider_name:
        company = qs.filter(trading_name__icontains=provider_name).order_by("-average_rating", "-total_reviews").first()
    if company is None:
        return None

    standards = list(
        company.standards.values("standard_id", "standard_name", "level", "sector")
        .distinct()
        .order_by("standard_name")[:12]
    )
    details = _provider_summary(company, description_limit=800)
    details.update(
        {
            "website": company.website,
            "ukprn": company.ukprn,
            "ofsted_status": company.ofsted_status,
            "delivery_model": company.delivery_model,
            "verification_status": company.verification_status,
            "data_last_updated": company.data_last_updated.isoformat() if company.data_last_updated else None,
            "weaknesses": company.weaknesses[:5],
            "standards": standards,
        }
    )
    return details


def search_standards(query=None, sector=None, level=None):
    qs = Standard.objects.all()
    if query:
        qs = qs.filter(
            Q(standard_name__icontains=query)
            | Q(description__icontains=query)
            | Q(who_for__icontains=query)
            | Q(typical_learner__icontains=query)
            | Q(typical_employer__icontains=query)
        )
    if sector:
        qs = qs.filter(sector__icontains=sector)
    if level is not None:
        qs = qs.filter(level=level)

    qs = qs.annotate(
        active_provider_count=Count("companies", filter=Q(companies__status=Company.Status.ACTIVE), distinct=True)
    ).order_by("level", "standard_name")[:RESULTS_LIMIT]
    results = []
    for standard in qs:
        results.append(
            {
                "standard_id": standard.standard_id,
                "name": standard.standard_name,
                "level": standard.level,
                "sector": standard.sector,
                "duration": standard.duration,
                "max_funding": standard.max_funding,
                "provider_count": standard.active_provider_count,
                "description": standard.description[:500],
                "who_for": standard.who_for[:300],
            }
        )
    return results


def compare_providers(provider_ids=None):
    if not provider_ids:
        return []

    results = []
    seen = set()
    for raw_identifier in provider_ids[:4]:
        identifier = str(raw_identifier).strip()[:120]
        if not identifier:
            continue
        qs = Company.objects.filter(status=Company.Status.ACTIVE).prefetch_related("standards")
        company = qs.filter(slug=identifier).first()
        if company is None:
            company = qs.filter(trading_name__icontains=identifier).order_by("-average_rating", "-total_reviews").first()
        if company is None or company.slug in seen:
            continue
        seen.add(company.slug)
        results.append(_provider_summary(company, description_limit=250))
    return results


def _call_openai(payload):
    try:
        response = requests.post(
            OPENAI_RESPONSES_URL,
            headers={
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=REQUEST_TIMEOUT,
        )
    except requests.RequestException as exc:
        raise ChatbotUpstreamError(f"Could not reach OpenAI: {exc}") from exc

    if response.status_code != 200:
        raise ChatbotUpstreamError(f"OpenAI returned {response.status_code}: {response.text[:500]}")

    data = response.json()
    if data.get("error"):
        raise ChatbotUpstreamError(f"OpenAI returned an error: {data['error']}")
    return data


def _extract_text(response_data):
    if response_data.get("output_text"):
        return response_data["output_text"].strip()

    chunks = []
    for item in response_data.get("output", []):
        if item.get("type") != "message":
            continue
        for part in item.get("content", []):
            if part.get("type") == "output_text":
                chunks.append(part.get("text", ""))
    return "".join(chunks).strip()


def _function_calls(response_data):
    return [item for item in response_data.get("output", []) if item.get("type") == "function_call"]


def _parse_arguments(call, tool_name=None):
    raw_arguments = call.get("arguments") or "{}"
    try:
        parsed = json.loads(raw_arguments)
    except json.JSONDecodeError:
        return {}
    if not isinstance(parsed, dict):
        return {}

    allowed_keys = TOOL_ARGUMENT_KEYS.get(tool_name) or set().union(*TOOL_ARGUMENT_KEYS.values())
    cleaned = {key: parsed[key] for key in allowed_keys if key in parsed}
    for key in ("sector", "location", "keywords", "provider_id", "provider_name", "query"):
        if cleaned.get(key) is not None:
            cleaned[key] = str(cleaned[key])[:120]

    if cleaned.get("provider_ids") is not None:
        if isinstance(cleaned["provider_ids"], list):
            cleaned["provider_ids"] = [str(item)[:120] for item in cleaned["provider_ids"][:4] if str(item).strip()]
        else:
            cleaned.pop("provider_ids", None)

    if cleaned.get("level") is not None:
        try:
            cleaned["level"] = int(cleaned["level"])
        except (TypeError, ValueError):
            cleaned.pop("level", None)

    if cleaned.get("min_rating") is not None:
        try:
            cleaned["min_rating"] = min(max(float(cleaned["min_rating"]), 0), 5)
        except (TypeError, ValueError):
            cleaned.pop("min_rating", None)

    return cleaned


def _run_tool_call(call):
    name = call.get("name")
    arguments = _parse_arguments(call, name)
    if name == "search_providers":
        return search_providers(**arguments)
    if name == "get_provider_details":
        return get_provider_details(**arguments)
    if name == "search_standards":
        return search_standards(**arguments)
    if name == "compare_providers":
        return compare_providers(**arguments)
    return {"error": f"Unknown tool: {name}"}


def run_chat(previous_interaction_id, user_message):
    """Run one turn of the concierge conversation.

    `previous_interaction_id` (or None for a fresh conversation) is the response id this
    function returned last turn. OpenAI uses it to recall the conversation so far, so
    nothing else needs to be resent. Returns {"reply": str, "providers": [...],
    "interaction_id": str} where `providers` is every provider the tool surfaced this turn,
    deduplicated, and `interaction_id` should be passed back in on the next turn.
    """

    matched_providers = {}
    previous_response_id = previous_interaction_id
    next_input = [{"role": "user", "content": user_message}]
    data = {}

    for _ in range(MAX_TOOL_ITERATIONS):
        payload = {
            "model": settings.OPENAI_MODEL,
            "instructions": SYSTEM_PROMPT,
            "tools": CHATBOT_TOOLS,
            "input": next_input,
            "max_output_tokens": settings.OPENAI_MAX_OUTPUT_TOKENS,
            "store": True,
        }
        if previous_response_id:
            payload["previous_response_id"] = previous_response_id

        data = _call_openai(payload)
        previous_response_id = data.get("id") or previous_response_id

        calls = _function_calls(data)
        if not calls:
            break

        function_results = []
        for call in calls:
            result = _run_tool_call(call)
            provider_results = result if isinstance(result, list) else [result]
            for item in provider_results:
                if isinstance(item, dict) and item.get("provider_id"):
                    matched_providers[item["provider_id"]] = item
            result_value = json.dumps(result)
            function_results.append(
                {
                    "type": "function_call_output",
                    "call_id": call.get("call_id"),
                    "output": result_value,
                }
            )
        next_input = function_results

    reply_text = _extract_text(data)
    if not reply_text:
        reply_text = "Sorry, I couldn't put together a good answer for that - could you rephrase your question?"

    return {
        "reply": reply_text,
        "providers": list(matched_providers.values()),
        "interaction_id": previous_response_id,
    }
