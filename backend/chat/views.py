import json

from django.contrib.auth.models import User
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from friend import models
from .models import ChatRoom, Message
from .serializers import MessageSerializer

from friend.models import FriendRequest


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_chat(request):
    """Start a chat with a friend (or retrieve an existing chat)."""
    data = request.data
    try:
        friend = User.objects.get(id=data['friend_id'])
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    # 🔒 Ensure the users are friends
    is_friend = FriendRequest.objects.filter(
        (Q(sender=request.user, receiver=friend) | Q(sender=friend, receiver=request.user)),
        status="accepted"
    ).exists()

    if not is_friend:
        return Response({"error": "You can only chat with friends"}, status=status.HTTP_403_FORBIDDEN)

    # Find or create a chat room for these two users
    room_name = f"chat_{min(request.user.id, friend.id)}_{max(request.user.id, friend.id)}"
    chat_room, created = ChatRoom.objects.get_or_create(name=room_name)

    # Add both users to the room if they aren’t already members
    chat_room.members.add(request.user, friend)

    return Response({"room_id": chat_room.id, "room_name": chat_room.name}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    data = request.data

    # Ensure room_id or room_name exists
    if 'room_id' not in data and 'room_name' not in data:
        return Response({"error": "room_id or room_name is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Find or create the chat room
    if 'room_id' in data:
        try:
            room = ChatRoom.objects.get(id=data['room_id'])
        except ChatRoom.DoesNotExist:
            return Response({"error": "Chat room not found"}, status=status.HTTP_404_NOT_FOUND)
    else:
        room, _ = ChatRoom.objects.get_or_create(name=data['room_name'])

    # Ensure the user is part of the room
    if request.user not in room.members.all():
        room.members.add(request.user)

    # 🔒 Check if the user is allowed to chat
    other_members = room.members.exclude(id=request.user.id)
    if not other_members.exists():
        return Response({"error": "You cannot chat in an empty room"}, status=status.HTTP_400_BAD_REQUEST)

    for other_user in other_members:
        is_friend = FriendRequest.objects.filter(
            (models.Q(sender=request.user, receiver=other_user) |
             models.Q(sender=other_user, receiver=request.user)),
            status="accepted"
        ).exists()

        if not is_friend:
            return Response({"error": "You can only chat with friends"}, status=status.HTTP_403_FORBIDDEN)

    # Create and save the message
    message = Message.objects.create(
        room=room,
        user=request.user,
        content=data['content']
    )

    return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request):
    """Fetch messages from a specific chat room"""
    room_id = request.GET.get('room_id')

    if not room_id:
        return Response({"error": "room_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        room = ChatRoom.objects.get(id=room_id)
    except ChatRoom.DoesNotExist:
        return Response({"error": "Chat room not found"}, status=status.HTTP_404_NOT_FOUND)

    # 🔒 Ensure the user is part of this room
    if request.user not in room.members.all():
        return Response({"error": "You are not a member of this chat room"}, status=status.HTTP_403_FORBIDDEN)

    messages = Message.objects.filter(room=room).order_by('timestamp')

    response_data = [
        {
            "id": msg.id,
            "sender": msg.user.username,
            "content": msg.content,
            "timestamp": msg.timestamp
        }
        for msg in messages
    ]

    return Response(response_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_user_chat_rooms(request):
    user_rooms = ChatRoom.objects.filter(members=request.user)

    room_list = [
        {"id": room.id, "name": room.name}
        for room in user_rooms
    ]

    return Response(room_list)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_chat_room(request):
    data = request.data

    # Check if room_id is provided
    if 'room_id' not in data:
        return Response({"error": "room_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        room = ChatRoom.objects.get(id=data['room_id'])
    except ChatRoom.DoesNotExist:
        return Response({"error": "Chat room not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check if the user is in the room
    if request.user in room.members.all():
        room.members.remove(request.user)

        # 🚨 If no members left, delete the room
        if room.members.count() == 0:
            room.delete()
            return Response({"message": f"Chat room '{room.name}' has been deleted as it is now empty."},
                            status=status.HTTP_200_OK)

        return Response({"message": f"You have left the chat room: {room.name}"}, status=status.HTTP_200_OK)

    return Response({"error": "You are not a member of this chat room"}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def store_message(request):
    try:

        data = json.loads(request.body)

        if not isinstance(data, dict):
            return JsonResponse({"error": "Invalid JSON format"}, status=400)

        if 'room_id' not in data or 'message' not in data:
            return JsonResponse({"error": "Missing room_id or message"}, status=400)

        room_id = data['room_id']
        content = data['message']
        user = request.user

        try:
            room = ChatRoom.objects.get(id=room_id)
        except ChatRoom.DoesNotExist:
            return JsonResponse({"error": "Chat room not found"}, status=404)

        message = Message.objects.create(room=room, user=user, content=content)

        return JsonResponse({"message": "Message stored successfully", "message_id": message.id}, status=201)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


