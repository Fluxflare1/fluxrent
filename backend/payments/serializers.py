# backend/payments/serializers.py
from rest_framework import serializers
from .models import PaymentRecord
from bills.models import Invoice

class PaymentRecordSerializer(serializers.ModelSerializer):
    tenant = serializers.PrimaryKeyRelatedField(read_only=True)
    invoice = serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.all())

    class Meta:
        model = PaymentRecord
        fields = [
            "id", "uid", "invoice", "tenant", "amount", "method", "reference",
            "status", "confirmed_by", "created_at", "confirmed_at"
        ]
        read_only_fields = ["uid", "created_at", "tenant", "status", "confirmed_at", "confirmed_by"]

    def validate(self, data):
        invoice = data["invoice"]
        amount = data["amount"]
        if invoice.is_paid:
            raise serializers.ValidationError("Invoice already marked as paid.")
        if amount <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        if amount > invoice.total_amount:
            # allow partial payments, but guard obvious overpayments
            raise serializers.ValidationError("Cannot record payment greater than invoice total here; use refund flows if needed.")
        return data

    def create(self, validated_data):
        # The view should set tenant=request.user
        return super().create(validated_data)
