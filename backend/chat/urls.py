from django.urls import path
from .views import save_message, get_messages

urlpatterns = [
    path("api/save_message/", save_message),
    path("api/get_messages/<str:room_name>/", get_messages),
]
