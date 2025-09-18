# backend/templates_app/serializers.py
from rest_framework import serializers
from .models import Template

class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = ["id", "name", "slug", "subject", "body", "created_at"]
        read_only_fields = ["id", "created_at"]
