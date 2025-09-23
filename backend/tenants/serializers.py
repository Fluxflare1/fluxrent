from rest_framework import serializers
from .models import TenantBond, TenantApartment, StatementOfStay


class TenantBondSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantBond
        fields = ["id", "uid", "tenant", "property_manager", "status", "created_at"]
        read_only_fields = ["uid", "status", "created_at"]


class TenantApartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantApartment
        fields = [
            "id", "uid", "tenant_bond", "apartment",
            "start_date", "end_date", "is_active", "created_at"
        ]
        read_only_fields = ["uid", "created_at"]


class StatementOfStaySerializer(serializers.ModelSerializer):
    class Meta:
        model = StatementOfStay
        fields = ["id", "uid", "tenant_apartment", "summary", "issued_at"]
        read_only_fields = ["uid", "issued_at"]
