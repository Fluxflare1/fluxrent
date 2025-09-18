# backend/agreements/serializers.py
from rest_framework import serializers
from .models import Agreement

class AgreementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agreement
        fields = ["id", "tenant", "apartment", "start_date", "end_date", "signed", "created_at"]
        read_only_fields = ["id", "created_at"]
