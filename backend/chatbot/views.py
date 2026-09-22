import logging

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle

from chatbot.services import ChatbotUpstreamError, run_chat

logger = logging.getLogger(__name__)

MAX_MESSAGE_LENGTH = 2000


class ChatbotRateThrottle(SimpleRateThrottle):
    scope = "chatbot"

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = f"user-{request.user.pk}"
        else:
            ident = self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": ident}


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([ChatbotRateThrottle])
def chat_message(request):
    if not settings.OPENAI_API_KEY:
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

    # OpenAI's Responses API carries state through the previous response id. The client
    # keeps passing it as the existing opaque interaction_id contract.
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
