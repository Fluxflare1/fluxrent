# backend/rents/serializers.py
from rest_framework import serializers
from .models import Tenancy, LateFeeRule, RentInvoice, RentPayment, Receipt
from django.utils import timezone
from decimal import Decimal

class TenancySerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenancy
        fields = ["id", "uid", "tenant", "apartment", "start_date", "end_date", "monthly_rent", "billing_cycle", "is_active", "created_at"]
        read_only_fields = ["uid", "created_at"]

class LateFeeRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = LateFeeRule
        fields = ["id", "property", "enabled", "percentage", "fixed_amount", "grace_days"]

class RentInvoiceSerializer(serializers.ModelSerializer):
    tenancy_uid = serializers.CharField(source="tenancy.uid", read_only=True)
    tenant = serializers.PrimaryKeyRelatedField(source="tenancy.tenant", read_only=True)
    class Meta:
        model = RentInvoice
        fields = ["id", "uid", "tenancy", "tenancy_uid", "tenant", "issue_date", "due_date", "amount", "outstanding", "status", "description", "created_at", "updated_at"]
        read_only_fields = ["uid", "issue_date", "outstanding", "status", "created_at", "updated_at"]

class RentPaymentCreateSerializer(serializers.Serializer):
    invoice_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=14, decimal_places=2)
    method = serializers.ChoiceField(choices=[m[0] for m in RentPayment._meta.get_field("method").choices])
    reference = serializers.CharField(max_length=255, allow_blank=True, required=False)

    def validate(self, data):
        try:
            invoice = RentInvoice.objects.get(pk=data["invoice_id"])
        except RentInvoice.DoesNotExist:
            raise serializers.ValidationError("Invoice not found.")
        if invoice.status == "paid":
            raise serializers.ValidationError("Invoice already paid.")
        if Decimal(data["amount"]) <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        return data

class RentPaymentSerializer(serializers.ModelSerializer):
    invoice_uid = serializers.CharField(source="invoice.uid", read_only=True)
    class Meta:
        model = RentPayment
        fields = ["id", "uid", "invoice", "invoice_uid", "payer", "amount", "method", "reference", "status", "created_at", "confirmed_at", "confirmed_by"]
        read_only_fields = ["uid", "status", "created_at", "confirmed_at", "confirmed_by"]

class ReceiptSerializer(serializers.ModelSerializer):
    payment_uid = serializers.CharField(source="payment.uid", read_only=True)
    class Meta:
        model = Receipt
        fields = ["id", "uid", "payment", "payment_uid", "issued_at", "meta"]
        read_only_fields = ["uid", "issued_at"]
