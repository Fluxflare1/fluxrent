backend/users/serializers.py
from rest_framework import serializers
from .models import User, KYC
from django.contrib.auth import password_validation


class KYCSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYC
        fields = ["full_name", "address", "bvn", "id_number", "id_type", "verified", "verified_at"]


class UserSerializer(serializers.ModelSerializer):
    kyc = KYCSerializer(read_only=True)
    class Meta:
        model = User
        fields = ["id", "uid", "email", "first_name", "last_name", "phone_number", "role", "date_joined", "kyc"]  # ✅ Removed: is_active
        read_only_fields = ["id", "uid", "date_joined"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "phone_number", "role"]

    def validate_password(self, value):
        password_validation.validate_password(value, self.instance)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        password_validation.validate_password(value, self.context.get("request").user)
        return value
