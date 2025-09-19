# backend/properties/serializers.py
from rest_framework import serializers
from .models import Property
from apartments.models import Apartment

class ApartmentSerializer(serializers.ModelSerializer):
    property_uid = serializers.CharField(source="property.uid", read_only=True)
    tenant_email = serializers.EmailField(source="tenant.email", read_only=True)

    class Meta:
        model = Apartment
        fields = [
            "id",
            "uid",
            "property",
            "property_uid",
            "number",
            "floor",
            "bedrooms",
            "rent_amount",
            "is_occupied",
            "tenant",
            "tenant_email",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "uid", "created_at", "updated_at", "property_uid", "tenant_email")


class PropertySerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    apartments = ApartmentSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "uid",
            "name",
            "address",
            "state_code",
            "lga_code",
            "street",
            "house_no",
            "owner",
            "owner_email",
            "external_id",
            "created_at",
            "updated_at",
            "apartments",
        ]
        read_only_fields = ("id", "uid", "created_at", "updated_at", "owner_email")


