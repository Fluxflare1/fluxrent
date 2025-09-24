from rest_framework import serializers
from .models import PaymentRecord
from bills.models import Invoice


class PaymentRecordSerializer(serializers.ModelSerializer):
    invoice = serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.all())

    class Meta:
        model = PaymentRecord
        fields = ["id", "uid", "invoice", "amount", "method", "reference", "created_at", "confirmed"]
        read_only_fields = ["uid", "created_at", "confirmed"]


class ConfirmManualPaymentSerializer(serializers.Serializer):
    invoice_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    method = serializers.ChoiceField(choices=["cash", "bank_transfer"])
    reference = serializers.CharField(required=False, allow_blank=True)
