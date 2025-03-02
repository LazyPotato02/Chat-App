from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Message, ChatRoom
from django.contrib.auth.models import User

@api_view(["POST"])
def save_message(request):
    data = request.data
    user = User.objects.get(username=data["username"])
    room, _ = ChatRoom.objects.get_or_create(name=data["room"])
    message = Message.objects.create(user=user, room=room, content=data["message"])
    return Response({"message": message.content, "username": message.user.username, "timestamp": message.timestamp})

@api_view(["GET"])
def get_messages(request, room_name):
    room = ChatRoom.objects.get(name=room_name)
    messages = Message.objects.filter(room=room).order_by("-timestamp")[:50]
    return Response([
        {"username": msg.user.username, "message": msg.content, "timestamp": msg.timestamp}
        for msg in messages
    ])
