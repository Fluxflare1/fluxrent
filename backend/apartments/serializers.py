# backend/apartments/serializers.py
from rest_framework import serializers
from .models import Apartment

class ApartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apartment
        fields = ["id", "uid", "property", "number", "floor", "bedrooms", "rent_amount", "created_at"]
        read_only_fields = ["id", "created_at"]
