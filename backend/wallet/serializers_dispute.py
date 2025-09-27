# backend/wallet/serializers_dispute.py
from rest_framework import serializers
from django.utils import timezone
from .models_dispute import Dispute, DisputeComment
from wallet.models import WalletTransaction

class DisputeCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.get_full_name", read_only=True)

    class Meta:
        model = DisputeComment
        fields = ["id", "dispute", "author", "author_name", "comment", "internal", "created_at"]
        read_only_fields = ["id", "author", "author_name", "created_at"]

class DisputeSerializer(serializers.ModelSerializer):
    raised_by_name = serializers.CharField(source="raised_by.get_full_name", read_only=True)
    wallet_transaction_uid = serializers.CharField(source="wallet_transaction.uid", read_only=True)

    class Meta:
        model = Dispute
        fields = [
            "id", "uid", "raised_by", "raised_by_name", "wallet_transaction", "wallet_transaction_uid",
            "payment_reference", "amount", "reason", "evidence", "status", "resolution_note",
            "resolved_by", "resolved_at", "created_at", "updated_at"
        ]
        read_only_fields = ["uid", "status", "resolution_note", "resolved_by", "resolved_at", "created_at", "updated_at", "raised_by"]

    def validate(self, data):
        # require either wallet_transaction or payment_reference
        if not data.get("wallet_transaction") and not data.get("payment_reference"):
            raise serializers.ValidationError("Either 'wallet_transaction' or 'payment_reference' must be provided.")
        if data.get("amount") is not None and data.get("amount") <= 0:
            raise serializers.ValidationError("Amount, if provided, must be positive.")
        return data

    def create(self, validated_data):
        # set raised_by from context
        user = self.context["request"].user
        validated_data["raised_by"] = user

        # if wallet_transaction provided and amount not provided, derive from it
        tx = validated_data.get("wallet_transaction")
        if tx and not validated_data.get("amount"):
            validated_data["amount"] = tx.amount

        return super().create(validated_data)
