# backend/core/serializers/mock_serializers.py
from rest_framework import serializers

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
