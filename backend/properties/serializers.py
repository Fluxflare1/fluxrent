from rest_framework import serializers
from .models import Property, Apartment


class ApartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apartment
        fields = [
            "id", "uid", "property", "name", "floor",
            "bedrooms", "bathrooms", "rent_amount",
            "is_available", "created_at",
            "rent_account", "bills_account"
        ]
        read_only_fields = ["uid", "created_at", "rent_account", "bills_account"]


class PropertySerializer(serializers.ModelSerializer):
    apartments = ApartmentSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            "id", "uid", "manager", "name", "address",
            "description", "created_at", "apartments"
        ]
        read_only_fields = ["uid", "created_at"]
