import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ChatRoom, Message
from .serializers import MessageSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    data = request.data

    # Find or create the room
    room = None
    if 'room_id' in data:
        try:
            room = ChatRoom.objects.get(id=data['room_id'])
        except ChatRoom.DoesNotExist:
            return Response({"error": "Chat room not found"}, status=status.HTTP_404_NOT_FOUND)
    elif 'room_name' in data:
        room, _ = ChatRoom.objects.get_or_create(name=data['room_name'])

    # Add user to room if not already a member
    if request.user not in room.members.all():
        room.members.add(request.user)

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
    messages = Message.objects.all().order_by('-timestamp')[:50]  # Last 50 messages
    return Response(MessageSerializer(messages, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_user_chat_rooms(request):
    user_rooms = request.user.chat_rooms.all()
    return Response([{"id": room.id, "name": room.name} for room in user_rooms])


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
        print("🔍 Request Body:", request.body)  # ✅ Debugging

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
