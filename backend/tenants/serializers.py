from rest_framework import serializers
from django.conf import settings
from django.contrib.auth import get_user_model  # ← ADD THIS IMPORT
from .models import TenantApartment, BondRequest

# We'll serialize minimal apartment fields to avoid tight coupling.
# The apartments app should have a detailed serializer for full details.

class TenantApartmentSerializer(serializers.ModelSerializer):
    tenant_id = serializers.PrimaryKeyRelatedField(source="tenant", read_only=True)
    apartment_id = serializers.PrimaryKeyRelatedField(source="apartment", read_only=True)

    class Meta:
        model = TenantApartment
        fields = [
            "id",
            "tenant_id",
            "apartment_id",
            "bond_status",
            "initiated_by",
            "requested_at",
            "activated_at",
            "terminated_at",
            "notes",
        ]
        read_only_fields = ["requested_at", "activated_at", "terminated_at"]


class BondRequestCreateSerializer(serializers.ModelSerializer):
    # FIXED: Use get_user_model() instead of settings.AUTH_USER_MODEL
    tenant_id = serializers.PrimaryKeyRelatedField(
        source="tenant", 
        queryset=get_user_model().objects.all()  # ← CORRECTED LINE
    )
    apartment = serializers.PrimaryKeyRelatedField(queryset=None)  # set in __init__

    message = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = BondRequest
        fields = ["id", "tenant_id", "apartment", "initiator", "message", "status", "created_at"]
        read_only_fields = ["status", "created_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # import here to avoid circular import problems if apartments app not ready
        from apartments.models import Apartment  # noqa
        self.fields["apartment"].queryset = Apartment.objects.all()


class BondRequestSerializer(serializers.ModelSerializer):
    tenant = serializers.PrimaryKeyRelatedField(read_only=True)
    apartment = serializers.PrimaryKeyRelatedField(read_only=True)
    initiator = serializers.PrimaryKeyRelatedField(read_only=True)
    processed_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = BondRequest
        fields = ["id", "tenant", "apartment", "initiator", "message", "status", "created_at", "processed_at", "processed_by"]
        read_only_fields = fields
