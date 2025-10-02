# backend/owner/serializers.py
from rest_framework import serializers
from users.models import User
from properties.models import Property
from wallets.models import Transaction
from .models import PlatformSetting

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

class RevenueTrendSerializer(serializers.Serializer):
    month = serializers.CharField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)

class UserGrowthSerializer(serializers.Serializer):
    month = serializers.CharField()
    users = serializers.IntegerField()

class TopBoostedPropertySerializer(serializers.Serializer):
    property_id = serializers.IntegerField()
    title = serializers.CharField()
    boosts = serializers.IntegerField()

class MonthValueSerializer(serializers.Serializer):
    month = serializers.CharField()
    value = serializers.FloatField()

class TopBoostPropertySerializer(serializers.Serializer):
    property_id = serializers.IntegerField()
    title = serializers.CharField()
    revenue = serializers.FloatField()
