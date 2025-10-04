# backend/bills/serializers.py
from rest_framework import serializers
from .models import Invoice, BillItem
from payments.serializers import PaymentRecordSerializer
from django.db import transaction
from decimal import Decimal

class BillItemSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=False, required=False)  # allow id for updates

    class Meta:
        model = BillItem
        fields = ["id", "uid", "description", "amount", "invoice"]
        read_only_fields = ["uid", "invoice"]

class BillItemCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer used when creating/updating nested items.
    """
    id = serializers.IntegerField(required=False)

    class Meta:
        model = BillItem
        fields = ["id", "description", "amount"]

class InvoiceSerializer(serializers.ModelSerializer):
    items = BillItemCreateUpdateSerializer(many=True, required=False)
    payments = PaymentRecordSerializer(many=True, read_only=True, source="payments")

    class Meta:
        model = Invoice
        fields = [
            "id",
            "uid",
            "tenant_apartment",
            "type",
            "total_amount",
            "issued_at",
            "due_date",
            "is_paid",
            "items",
            "payments",
        ]
        read_only_fields = ["uid", "issued_at", "is_paid"]

    def validate_total_amount(self, value):
        # ensure positive
        if value is None or Decimal(value) < Decimal("0.00"):
            raise serializers.ValidationError("Total amount must be >= 0.")
        return value

    def _calc_total_from_items(self, items_data):
        total = Decimal("0.00")
        for item in items_data:
            amt = Decimal(str(item.get("amount", "0")))
            total += amt
        return total.quantize(Decimal("0.01"))

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        # If total_amount omitted or zero, calculate from items
        if not validated_data.get("total_amount") and items_data:
            validated_data["total_amount"] = self._calc_total_from_items(items_data)
        invoice = Invoice.objects.create(**validated_data)
        # create items
        for item in items_data:
            BillItem.objects.create(invoice=invoice, description=item["description"], amount=item["amount"])
        return invoice

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        # update simple fields
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        # If total_amount not explicitly provided but items_data present, recalc total
        if (validated_data.get("total_amount") is None) and items_data is not None:
            instance.total_amount = self._calc_total_from_items(items_data)
        instance.save()

        if items_data is not None:
            # Handle items: update existing, create new, delete removed
            existing_items = {i.id: i for i in instance.items.all()}
            incoming_ids = []
            for item in items_data:
                item_id = item.get("id")
                if item_id and item_id in existing_items:
                    bi = existing_items[item_id]
                    bi.description = item["description"]
                    bi.amount = item["amount"]
                    bi.save(update_fields=["description", "amount"])
                    incoming_ids.append(item_id)
                else:
                    bi = BillItem.objects.create(invoice=instance, description=item["description"], amount=item["amount"])
                    incoming_ids.append(bi.id)
            # delete items not included
            for existing_id in list(existing_items.keys()):
                if existing_id not in incoming_ids:
                    existing_items[existing_id].delete()
        return instance
