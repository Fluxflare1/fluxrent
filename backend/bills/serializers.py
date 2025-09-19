# backend/bills/serializers.py
from rest_framework import serializers
from decimal import Decimal
from .models import BillType, Bill, Invoice, InvoiceLine, Payment
from django.conf import settings

# Serializer for BillType
class BillTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillType
        fields = ["id", "name", "description", "is_recurring", "default_amount"]


class BillSerializer(serializers.ModelSerializer):
    bill_type = BillTypeSerializer(read_only=True)
    bill_type_id = serializers.PrimaryKeyRelatedField(queryset=BillType.objects.all(), write_only=True, source="bill_type")

    class Meta:
        model = Bill
        fields = [
            "id",
            "apartment",
            "bill_type",
            "bill_type_id",
            "amount",
            "start_date",
            "end_date",
            "is_active",
            "notes",
        ]
        read_only_fields = ["id", "bill_type"]

    def validate_amount(self, value):
        if value is None or Decimal(value) < 0:
            raise serializers.ValidationError("Amount must be >= 0")
        return value


class InvoiceLineSerializer(serializers.ModelSerializer):
    bill = serializers.PrimaryKeyRelatedField(queryset=Bill.objects.all(), allow_null=True, required=False)

    class Meta:
        model = InvoiceLine
        fields = ["id", "bill", "description", "amount"]
        read_only_fields = ["id"]


class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True)
    tenant_apartment = serializers.PrimaryKeyRelatedField(queryset=None)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "invoice_no",
            "tenant_apartment",
            "issue_date",
            "due_date",
            "status",
            "total_amount",
            "paid_amount",
            "lines",
            "notes",
            "metadata",
        ]
        read_only_fields = ["id", "invoice_no", "total_amount", "paid_amount"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # lazy set queryset for tenant_apartment to avoid import issues
        from tenants.models import TenantApartment  # local import
        self.fields["tenant_apartment"].queryset = TenantApartment.objects.all()

    def create(self, validated_data):
        lines_data = validated_data.pop("lines", [])
        # generate invoice_no
        validated_data["invoice_no"] = generate_invoice_no_for_serializer()
        invoice = Invoice.objects.create(**validated_data)
        total = 0
        for line in lines_data:
            ln = InvoiceLine.objects.create(invoice=invoice, **line)
            total += ln.amount
        invoice.total_amount = total
        invoice.save(update_fields=["total_amount"])
        return invoice

    def update(self, instance, validated_data):
        # allow editing lines: replace current lines with provided
        lines_data = validated_data.pop("lines", None)
        for attr, v in validated_data.items():
            setattr(instance, attr, v)
        instance.save()
        if lines_data is not None:
            instance.lines.all().delete()
            total = 0
            for line in lines_data:
                ln = InvoiceLine.objects.create(invoice=instance, **line)
                total += ln.amount
            instance.total_amount = total
            instance.save(update_fields=["total_amount"])
        instance.recalc_totals()
        return instance


def generate_invoice_no_for_serializer():
    # import here to avoid circular import at module load
    from .models import InvoiceSeq
    year = timezone.now().year
    seq = InvoiceSeq.objects.create()
    return f"INV/{year}/{str(seq.id).zfill(6)}"


class PaymentSerializer(serializers.ModelSerializer):
    invoice = serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.all())
    class Meta:
        model = Payment
        fields = ["id", "invoice", "payment_ref", "amount", "method", "status", "paid_at", "metadata", "created_at"]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        # When creating a payment, default status is pending; confirmation occurs via confirm endpoint or webhook.
        payment = Payment.objects.create(**validated_data)
        return payment
