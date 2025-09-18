# backend/properties/serializers.py
from rest_framework import serializers
from .models import Property

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ["id", "uid", "name", "address", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
