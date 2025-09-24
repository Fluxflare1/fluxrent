# backend/bills/serializers.py
from rest_framework import serializers
from .models import Invoice, BillItem
from payments.serializers import PaymentRecordSerializer  # import canonical payments serializer

class BillItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillItem
        fields = ["id", "uid", "description", "amount", "invoice"]
        read_only_fields = ["uid"]

class InvoiceSerializer(serializers.ModelSerializer):
    items = BillItemSerializer(many=True, read_only=True)
    payments = PaymentRecordSerializer(many=True, read_only=True, source="payments")

    class Meta:
        model = Invoice
        fields = [
            "id", "uid", "tenant_apartment", "type", "total_amount",
            "issued_at", "due_date", "is_paid", "items", "payments"
        ]
        read_only_fields = ["uid", "issued_at", "is_paid"]
