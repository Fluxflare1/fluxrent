# backend/owner/serializers.py
from rest_framework import serializers
from users.models import User
from properties.models import Property
from wallets.models import Transaction
from .models import PlatformSetting, AdminActionLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "role", "is_active", "kyc_verified", "date_joined"]

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ["id", "title", "status", "boost_until", "created_at"]

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["id", "amount", "currency", "type", "status", "created_at"]

class PlatformSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSetting
        fields = "__all__"
