from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.serializers import ModelSerializer

class RegisterSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            password=make_password(validated_data['password'])
        )
        return user