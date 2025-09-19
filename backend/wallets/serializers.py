from rest_framework import serializers
from .models import Wallet, WalletTransaction, SavingsPlan


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = "__all__"
        read_only_fields = ["id", "user", "balance", "created_at", "updated_at"]


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = "__all__"
        read_only_fields = ["id", "status", "created_at"]


class SavingsPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsPlan
        fields = "__all__"
        read_only_fields = ["id", "current_balance", "status", "created_at", "updated_at"]
