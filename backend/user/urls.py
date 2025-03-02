from django.urls import path

from user.views import RegisterView, LogoutView

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('logout', LogoutView.as_view(), name='register'),
]