from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import KYC

User = get_user_model()


class UserPublicSerializer(serializers.ModelSerializer):
    """Limited public view for users (used in lists)."""
    class Meta:
        model = User
        fields = ("uid", "email", "first_name", "last_name", "role")


class UserDetailSerializer(serializers.ModelSerializer):
    """Full user representation for authenticated requests."""
    class Meta:
        model = User
        fields = (
            "uid",
            "email",
            "phone_number",
            "first_name",
            "last_name",
            "role",
            "kyc_completed",
            "is_active",
            "is_staff",
            "date_joined",
        )
        read_only_fields = ("uid", "kyc_completed", "is_staff", "date_joined")


class RegisterSerializer(serializers.ModelSerializer):
    """Create user endpoint; creates user and optionally initial KYC if provided."""
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    # optional KYC payload
    kyc = serializers.JSONField(required=False, write_only=True)

    class Meta:
        model = User
        fields = ("email", "phone_number", "first_name", "last_name", "password", "password2", "role", "kyc")
        read_only_fields = ("role",)  # default role assignment policy: platform assigns roles

    def validate_email(self, value):
        value = User.objects.normalize_email(value)
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def validate(self, data):
        if data.get("password") != data.get("password2"):
            raise serializers.ValidationError({"password": "Passwords must match."})
        return data

    @transaction.atomic
    def create(self, validated_data):
        kyc_data = validated_data.pop("kyc", None)
        validated_data.pop("password2", None)
        password = validated_data.pop("password")
        # role default is BASE — admin will update when needed
        user = User.objects.create_user(password=password, **validated_data)
        if kyc_data:
            # basic KYC creation; verification flag remains False until admin verifies
            KYC.objects.create(user=user, **kyc_data)
            user.kyc_completed = False
            user.save(update_fields=["kyc_completed"])
        return user


class KYCSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYC
        fields = ("id", "user", "date_of_birth", "national_id_number", "address", "city", "country", "verified", "created_at")
        read_only_fields = ("id", "created_at", "user", "verified")

    def create(self, validated_data):
        # 'user' must be set in view via serializer.save(user=request.user)
        return super().create(validated_data)


class RoleUpdateSerializer(serializers.Serializer):
    """Admin endpoint payload to update role for a user."""
    role = serializers.ChoiceField(choices=User.Role.choices)

    def validate(self, data):
        # Optional: add business logic, e.g., disallow direct assignment to OWNER except by platform owner
        return data
