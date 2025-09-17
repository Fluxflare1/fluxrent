# backend/core/serializers/mock_serializers.py
from rest_framework import serializers

# --- Core ---
class UserSerializer(serializers.Serializer):
    id = serializers.CharField()
    email = serializers.EmailField()
    name = serializers.CharField()
    role = serializers.CharField()
    status = serializers.CharField()


class TenantSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()


class BillSerializer(serializers.Serializer):
    id = serializers.CharField()
    amount = serializers.IntegerField()
    status = serializers.CharField()


class AgreementSerializer(serializers.Serializer):
    id = serializers.CharField()
    tenant = serializers.CharField()
    status = serializers.CharField()


class PrepaymentSerializer(serializers.Serializer):
    id = serializers.CharField()
    amount = serializers.IntegerField()
    status = serializers.CharField()


class DashboardSerializer(serializers.Serializer):
    users = serializers.IntegerField()
    tenants = serializers.IntegerField()
    bills = serializers.DictField()
    agreements = serializers.IntegerField()


# --- Extensions ---
class PropertySerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    location = serializers.CharField()


class ApartmentSerializer(serializers.Serializer):
    id = serializers.CharField()
    property_id = serializers.CharField()
    unit_number = serializers.CharField()
    status = serializers.CharField()


class UtilitySerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    cost = serializers.FloatField()


class TemplateSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    body = serializers.CharField()


class NotificationSerializer(serializers.Serializer):
    id = serializers.CharField()
    message = serializers.CharField()
    type = serializers.CharField()
