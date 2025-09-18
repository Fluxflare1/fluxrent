# backend/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "phone", "role", "uid", "dva", "is_active", "is_staff", "metadata")
        read_only_fields = ("id", "uid", "dva", "is_staff")

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "phone", "password", "role")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserAdminSerializer(UserSerializer):
    # Admin serializer exposes extra fields
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ("is_staff", "is_superuser", "date_joined")
        read_only_fields = ("uid",)
