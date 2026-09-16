import logging

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from chatbot.services import ChatbotUpstreamError, run_chat

logger = logging.getLogger(__name__)

MAX_MESSAGE_LENGTH = 2000


@api_view(["POST"])
@permission_classes([AllowAny])
def chat_message(request):
    if not settings.GEMINI_API_KEY:
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

    # Gemini's Interactions API is stateful on its own side — the client just carries the
    # opaque interaction_id forward turn to turn, rather than resending a transcript.
    interaction_id = request.data.get("interaction_id")
    if interaction_id is not None and not isinstance(interaction_id, str):
        interaction_id = None

    try:
        result = run_chat(interaction_id, message)
    except ChatbotUpstreamError as exc:
        logger.warning("Chatbot upstream call failed: %s", exc)
        return Response(
            {"message": "The chat assistant is temporarily unavailable. Please try again shortly."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response(result)
