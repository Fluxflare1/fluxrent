from rest_framework import serializers
from .models import Wallet, WalletTransaction, WalletSecurity


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ["id", "uid", "user", "wallet_type", "account_number", "balance", "ledger_balance", "is_active", "created_at"]
        read_only_fields = ["uid", "account_number", "balance", "ledger_balance", "created_at"]


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ["id", "uid", "wallet", "txn_type", "amount", "reference", "description", "created_at", "status"]
        read_only_fields = ["uid", "created_at", "status"]


class WalletSecuritySerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletSecurity
        fields = ["id", "wallet", "transaction_pin", "two_factor_enabled"]
