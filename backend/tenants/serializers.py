from rest_framework import serializers
from .models import TenantApartment, BondRequest, StatementOfStay


class TenantApartmentSerializer(serializers.ModelSerializer):
    tenant_display = serializers.StringRelatedField(source="tenant", read_only=True)
    apartment_display = serializers.StringRelatedField(source="apartment", read_only=True)

    class Meta:
        model = TenantApartment
        fields = [
            "id",
            "tenant",
            "tenant_display",
            "apartment",
            "apartment_display",
            "bond_status",
            "initiated_by",
            "requested_at",
            "activated_at",
            "terminated_at",
            "notes",
        ]
        read_only_fields = ["requested_at", "activated_at", "terminated_at", "bond_status"]


class BondRequestSerializer(serializers.ModelSerializer):
    tenant_display = serializers.StringRelatedField(source="tenant", read_only=True)
    apartment_display = serializers.StringRelatedField(source="apartment", read_only=True)

    class Meta:
        model = BondRequest
        fields = [
            "id",
            "tenant",
            "tenant_display",
            "apartment",
            "apartment_display",
            "initiator",
            "message",
            "status",
            "created_at",
            "processed_at",
            "processed_by",
        ]
        read_only_fields = ["status", "created_at", "processed_at", "processed_by"]

    def validate(self, attrs):
        """
        Prevent duplicate pending requests or existing active bond.
        """
        tenant = attrs.get("tenant", None) or self.instance and self.instance.tenant
        apartment = attrs.get("apartment", None) or self.instance and self.instance.apartment
        if tenant and apartment:
            # Check for existing active TenantApartment
            from .models import TenantApartment
            if TenantApartment.objects.filter(tenant=tenant, apartment=apartment, bond_status=TenantApartment.BondStatus.ACTIVE).exists():
                raise serializers.ValidationError("Tenant is already bonded to this apartment.")
            # Prevent duplicate pending request
            if BondRequest.objects.filter(tenant=tenant, apartment=apartment, status=BondRequest.RequestStatus.PENDING).exists():
                raise serializers.ValidationError("A pending bond request already exists for this tenant and apartment.")
        return attrs


class StatementOfStaySerializer(serializers.ModelSerializer):
    tenant = serializers.StringRelatedField(source="tenant_apartment.tenant", read_only=True)
    apartment = serializers.StringRelatedField(source="tenant_apartment.apartment", read_only=True)

    class Meta:
        model = StatementOfStay
        fields = ["id", "tenant_apartment", "tenant", "apartment", "generated_at", "total_billed", "total_paid", "balance", "notes"]
        read_only_fields = fields
