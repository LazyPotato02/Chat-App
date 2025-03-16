from django.urls import path

from user.views import RegisterView, LogoutView, list_users

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('logout', LogoutView.as_view(), name='register'),
path('list/', list_users, name='list_users'),
]