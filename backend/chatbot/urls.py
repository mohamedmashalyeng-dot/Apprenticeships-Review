from django.urls import path

from chatbot.views import chat_message

urlpatterns = [path("chatbot/message/", chat_message, name="chatbot-message")]
