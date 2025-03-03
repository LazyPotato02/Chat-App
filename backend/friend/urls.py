from django.urls import path
from .views import send_friend_request, respond_to_friend_request, list_friends, list_pending_requests, \
    cancel_friend_request, remove_friend

urlpatterns = [
    path('', list_friends, name='list_friends'),
    path('request', send_friend_request, name='send_friend_request'),
    path('requests', list_pending_requests, name='list_pending_requests'),
    path('respond', respond_to_friend_request, name='respond_to_friend_request'),
    path('cancel', cancel_friend_request, name='cancel_friend_request'),
    path('remove', remove_friend, name='remove_friend'),

]
