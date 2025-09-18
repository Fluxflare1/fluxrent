# backend/bills/serializers.py
from rest_framework import serializers
from .models import Bill

class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = ["id", "apartment", "description", "amount", "issued_at", "due_at", "paid"]
        read_only_fields = ["id", "issued_at"]
