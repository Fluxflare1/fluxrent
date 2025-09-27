# backend/disputes/serializers.py
from rest_framework import serializers
from .models import Dispute, DisputeAuditTrail

class DisputeSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    class Meta:
        model = Dispute
        fields = [
            "id", "uid", "user", "user_email", "transaction_reference", "amount",
            "reason", "status", "metadata", "assigned_to", "created_at", "updated_at", "resolved_at"
        ]
        read_only_fields = ["uid", "created_at", "updated_at", "resolved_at", "user_email"]

class DisputeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dispute
        fields = ["transaction_reference", "amount", "reason", "metadata"]

    def create(self, validated_data):
        # view will set user
        return super().create(validated_data)

class DisputeAuditSerializer(serializers.ModelSerializer):
    actor_email = serializers.CharField(source="actor.email", read_only=True)
    class Meta:
        model = DisputeAuditTrail
        fields = ["id", "dispute", "actor", "actor_email", "action", "data", "timestamp"]
        read_only_fields = ["id", "timestamp", "actor_email"]
