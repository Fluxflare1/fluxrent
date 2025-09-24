# backend/payments/serializers.py
from rest_framework import serializers
from .models import PaymentRecord
from bills.models import Invoice
from django.utils import timezone
from decimal import Decimal

class PaymentRecordSerializer(serializers.ModelSerializer):
    tenant = serializers.PrimaryKeyRelatedField(read_only=True)
    invoice = serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.all(), allow_null=True, required=False)

    class Meta:
        model = PaymentRecord
        fields = [
            "id", "uid", "invoice", "tenant", "amount", "method", "reference",
            "status", "confirmed_by", "created_at", "confirmed_at"
        ]
        read_only_fields = ["uid", "created_at", "tenant", "status", "confirmed_at", "confirmed_by"]

    def validate(self, data):
        invoice = data.get("invoice", None)
        amount = data.get("amount")
        if amount is None:
            raise serializers.ValidationError({"amount": "Amount is required."})
        if Decimal(amount) <= 0:
            raise serializers.ValidationError({"amount": "Amount must be positive."})
        if invoice:
            if invoice.is_paid:
                raise serializers.ValidationError("Invoice already marked as paid.")
            # disallow obvious overpayments here; allow equal or less
            if Decimal(amount) > invoice.total_amount:
                raise serializers.ValidationError("Cannot record payment greater than invoice total here; use refund flows if needed.")
        return data

    def create(self, validated_data):
        # Tenant will be set in view via serializer.save(tenant=request.user)
        # For manual confirmations (confirmed_by), views set those fields.
        return super().create(validated_data)


class ApplyPrepaymentSerializer(serializers.Serializer):
    prepayment_id = serializers.IntegerField()
    invoice_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)

    def validate(self, data):
        try:
            pre = PaymentRecord.objects.get(pk=data["prepayment_id"])
        except PaymentRecord.DoesNotExist:
            raise serializers.ValidationError({"prepayment_id": "Prepayment not found."})
        if pre.invoice is not None:
            raise serializers.ValidationError({"prepayment_id": "Provided payment is already attached to an invoice."})
        if pre.status != "success":
            raise serializers.ValidationError({"prepayment_id": "Only successful prepayments can be applied."})
        try:
            invoice = Invoice.objects.get(pk=data["invoice_id"])
        except Invoice.DoesNotExist:
            raise serializers.ValidationError({"invoice_id": "Invoice not found."})
        if invoice.is_paid:
            raise serializers.ValidationError({"invoice_id": "Invoice already paid."})
        return data
