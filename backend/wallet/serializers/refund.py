from rest_framework import serializers
from wallet.models.refund import Refund

class RefundSerializer(serializers.ModelSerializer):
    transaction_ref = serializers.CharField(source="transaction.reference", read_only=True)

    class Meta:
        model = Refund
        fields = [
            "id", "transaction_ref", "amount", "charge", "total_refund",
            "status", "requested_by", "approved_by", "created_at", "updated_at"
        ]
        read_only_fields = ["status", "requested_by", "approved_by", "created_at", "updated_at"]
