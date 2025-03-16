from django.urls import path

from user.views import RegisterView, LogoutView, list_users, get_current_user

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('logout', LogoutView.as_view(), name='register'),
    path('list/', list_users, name='list_users'),
    path('me/', get_current_user, name='get_current_user'),
]
