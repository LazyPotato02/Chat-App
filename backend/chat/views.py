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

    # If `room_id` exists, get the room
    room = None
    if 'room_id' in data:
        try:
            room = ChatRoom.objects.get(id=data['room_id'])
        except ChatRoom.DoesNotExist:
            return Response({"error": "Chat room not found"}, status=status.HTTP_404_NOT_FOUND)
    elif 'room_name' in data:
        room, _ = ChatRoom.objects.get_or_create(name=data['room_name'])
    else:
        return Response({"error": "room_id or room_name is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Create the message
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
