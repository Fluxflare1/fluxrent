# backend/finance/serializers.py
from rest_framework import serializers
from .models import FeeConfig, TransactionAudit, Dispute


class FeeConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeConfig
        fields = ["id", "channel", "percent", "fixed", "active", "created_at"]
        read_only_fields = ["id", "created_at"]


class TransactionAuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionAudit
        fields = [
            "id",
            "uid",
            "wallet_transaction_id",
            "payment_record_id",
            "source_wallet_uid",
            "destination_wallet_uid",
            "invoice_uid",
            "tenant_id",
            "channel",
            "gross_amount",
            "fee_amount",
            "net_amount",
            "currency",
            "reference",
            "status",
            "meta",
            "created_at",
            "updated_at",
            "notes",
        ]
        read_only_fields = ["id", "uid", "created_at", "updated_at"]


class DisputeSerializer(serializers.ModelSerializer):
    raised_by_name = serializers.CharField(source="raised_by.get_full_name", read_only=True)
    resolved_by_name = serializers.CharField(source="resolved_by.get_full_name", read_only=True)

    class Meta:
        model = Dispute
        fields = [
            "id",
            "uid",
            "transaction",
            "raised_by",
            "raised_by_name",
            "reason",
            "evidence",
            "status",
            "resolution",
            "resolution_note",
            "resolved_by",
            "resolved_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "uid", "raised_by", "created_at", "updated_at", "raised_by_name", "resolved_by_name"]

    def create(self, validated_data):
        # raised_by should be set in view (request.user)
        return super().create(validated_data)
