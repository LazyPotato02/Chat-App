from django.urls import path
from .views import send_message, get_messages, list_user_chat_rooms, leave_chat_room, store_message

urlpatterns = [

    path('store-message', store_message, name='store_message'),
    path('send', send_message, name='send_message'),
    path('messages', get_messages, name='get_messages'),
    path('rooms', list_user_chat_rooms, name='list_user_chat_rooms'),
    path('leave', leave_chat_room, name='leave_chat_room'),

]
