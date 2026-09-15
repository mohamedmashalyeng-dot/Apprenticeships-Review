import logging

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from chatbot.services import ChatbotUpstreamError, run_chat

logger = logging.getLogger(__name__)

MAX_MESSAGE_LENGTH = 2000
MAX_HISTORY_TURNS = 8


@api_view(["POST"])
@permission_classes([AllowAny])
def chat_message(request):
    if not settings.OPENROUTER_API_KEY:
        return Response(
            {"message": "The chat assistant isn't configured yet."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    message = (request.data.get("message") or "").strip()
    if not message:
        return Response({"message": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)
    if len(message) > MAX_MESSAGE_LENGTH:
        return Response(
            {"message": f"Message is too long (max {MAX_MESSAGE_LENGTH} characters)."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    raw_history = request.data.get("history") or []
    history = [
        {"role": turn.get("role"), "content": str(turn.get("content", ""))[:MAX_MESSAGE_LENGTH]}
        for turn in raw_history
        if isinstance(turn, dict) and turn.get("role") in ("user", "assistant") and turn.get("content")
    ][-MAX_HISTORY_TURNS:]

    try:
        result = run_chat(history, message)
    except ChatbotUpstreamError as exc:
        logger.warning("Chatbot upstream call failed: %s", exc)
        return Response(
            {"message": "The chat assistant is temporarily unavailable. Please try again shortly."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response(result)
