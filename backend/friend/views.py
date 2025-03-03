from django.db import models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import FriendRequest
from rest_framework import status


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_pending_requests(request):
    pending_requests = FriendRequest.objects.filter(receiver=request.user, status="pending")

    request_list = [
        {
            "id": fr.id,
            "sender_id": fr.sender.id,
            "sender_username": fr.sender.username,
            "timestamp": fr.timestamp
        }
        for fr in pending_requests
    ]

    return Response(request_list)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    data = request.data
    try:
        receiver = User.objects.get(id=data['receiver_id'])
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    # Prevent duplicate friend requests
    if FriendRequest.objects.filter(sender=request.user, receiver=receiver, status="pending").exists():
        return Response({"error": "Friend request already sent"}, status=status.HTTP_400_BAD_REQUEST)

    # Prevent sending requests to yourself
    if request.user == receiver:
        return Response({"error": "You cannot send a friend request to yourself"}, status=status.HTTP_400_BAD_REQUEST)

    friend_request = FriendRequest.objects.create(sender=request.user, receiver=receiver)
    return Response({"message": "Friend request sent"}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_to_friend_request(request):
    data = request.data
    try:
        friend_request = FriendRequest.objects.get(id=data['request_id'], receiver=request.user)
    except FriendRequest.DoesNotExist:
        return Response({"error": "Friend request not found"}, status=status.HTTP_404_NOT_FOUND)

    if data['response'] not in ["accepted", "rejected"]:
        return Response({"error": "Invalid response. Use 'accepted' or 'rejected'"}, status=status.HTTP_400_BAD_REQUEST)

    friend_request.status = data['response']
    friend_request.save()

    return Response({"message": f"Friend request {data['response']}"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_friends(request):
    friends = FriendRequest.objects.filter(
        (models.Q(sender=request.user) | models.Q(receiver=request.user)),
        status="accepted"
    )

    friend_list = [
        {
            "id": friend.sender.id if friend.receiver == request.user else friend.receiver.id,
            "username": friend.sender.username if friend.receiver == request.user else friend.receiver.username
        }
        for friend in friends
    ]

    return Response(friend_list)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_friend_request(request):
    data = request.data

    try:
        friend_request = FriendRequest.objects.get(id=data['request_id'], sender=request.user, status="pending")
    except FriendRequest.DoesNotExist:
        return Response({"error": "Friend request not found or already responded to"}, status=status.HTTP_404_NOT_FOUND)

    friend_request.delete()
    return Response({"message": "Friend request canceled"}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_friend(request):
    data = request.data

    try:
        friend = User.objects.get(id=data['friend_id'])
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check if the users are actually friends
    friendship = FriendRequest.objects.filter(
        models.Q(sender=request.user, receiver=friend) |
        models.Q(sender=friend, receiver=request.user),
        status="accepted"
    )

    if not friendship.exists():
        return Response({"error": "You are not friends with this user"}, status=status.HTTP_400_BAD_REQUEST)

    # Remove the friendship
    friendship.delete()
    return Response({"message": "Friend removed successfully"}, status=status.HTTP_200_OK)
