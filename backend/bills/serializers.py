from rest_framework import serializers
from .models import Invoice, BillItem, PaymentRecord

class BillItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillItem
        fields = ["id", "uid", "description", "amount", "invoice"]
        read_only_fields = ["uid"]

class PaymentRecordSerializer(serializers.ModelSerializer):
    invoice = serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.all())

    class Meta:
        model = PaymentRecord
        fields = ["id", "uid", "invoice", "amount_paid", "paid_at", "method"]
        read_only_fields = ["uid", "paid_at"]

    def validate(self, data):
        invoice = data["invoice"]
        if invoice.is_paid:
            raise serializers.ValidationError("Invoice already marked as paid.")
        if data["amount_paid"] > invoice.total_amount:
            raise serializers.ValidationError("Cannot pay more than invoice total.")
        return data

    def create(self, validated_data):
        invoice = validated_data["invoice"]
        amount = validated_data["amount_paid"]

        # Update invoice status if fully paid
        if amount >= invoice.total_amount:
            invoice.is_paid = True
            invoice.save()

        return super().create(validated_data)

class InvoiceSerializer(serializers.ModelSerializer):
    items = BillItemSerializer(many=True, read_only=True)
    payments = PaymentRecordSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id", "uid", "tenant_apartment", "type", "total_amount",
            "issued_at", "due_date", "is_paid", "items", "payments"
        ]
        read_only_fields = ["uid", "issued_at", "is_paid"]
