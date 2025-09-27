from rest_framework import serializers
from .models import Wallet, WalletTransaction, WalletSecurity, StandingOrder, PaystackCustomer, DedicatedVirtualAccount, Transaction, FixedSaving, Bill

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ["id", "uid", "user", "wallet_type", "account_number", "paystack_account_id", "balance", "ledger_balance", "is_active", "created_at"]
        read_only_fields = ["uid", "account_number", "paystack_account_id", "balance", "ledger_balance", "created_at"]

class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ["id", "uid", "wallet", "txn_type", "amount", "reference", "description", "created_at", "status"]
        read_only_fields = ["uid", "created_at", "status"]

class WalletSecuritySerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletSecurity
        fields = ["id", "wallet", "transaction_pin_hash", "two_factor_enabled"]

class StandingOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = StandingOrder
        fields = ["id", "uid", "wallet", "tenant_apartment", "pay_all_bills", "bill_types", "is_active", "created_at"]
        read_only_fields = ["uid", "created_at"]

# From Code 2 - Enhanced to match Code 1 style
class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = ["id", "wallet", "bill_type", "amount", "due_date", "status", "description", "created_at"]
        read_only_fields = ["id", "created_at"]

class FixedSavingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FixedSaving
        fields = ["id", "wallet", "amount", "locked_until", "interest_rate", "status", "created_at"]
        read_only_fields = ["id", "created_at"]

# TransactionSerializer from Code 2 
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["id", "wallet", "txn_type", "amount", "reference", "description", "created_at", "status"]
        read_only_fields = ["id", "created_at", "status"]

# Your existing Paystack serializers
class PaystackCreateCustomerSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)

class PaystackAssignDvaSerializer(serializers.Serializer):
    wallet_id = serializers.IntegerField()
    preferred_bank = serializers.CharField(required=False, allow_blank=True)

class PaystackDvaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DedicatedVirtualAccount
        fields = ["id", "wallet", "paystack_id", "account_number", "bank_name", "currency", "metadata", "created_at"]
        read_only_fields = ["paystack_id", "account_number", "bank_name", "currency", "metadata", "created_at"]
