# backend/wallet/models.py
import uuid
from decimal import Decimal
from django.db import models, transaction
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL


def generate_uid(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12].upper()}"


class Wallet(models.Model):
    """
    Digital wallet for users (personal & business).
    Auto-created after KYC (personal) or PM/Agent account setup (business).
    """
    WALLET_TYPES = [
        ("personal", "Personal"),
        ("property_manager", "Property Manager"),
        ("agent", "Agent"),
    ]

    uid = models.CharField(max_length=32, unique=True, default=lambda: generate_uid("WAL"))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wallets")
    wallet_type = models.CharField(max_length=30, choices=WALLET_TYPES)
    # For Paystack DVA assigned account number (NUBAN)
    account_number = models.CharField(max_length=32, unique=True, blank=True, null=True)
    # Optional: store assigned paystack dedicated_account id & metadata
    paystack_account_id = models.CharField(max_length=128, blank=True, null=True)
    balance = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal("0.00"))
    ledger_balance = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal("0.00"))
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["uid"]),
            models.Index(fields=["account_number"]),
        ]

    def __str__(self):
        return f"{self.user} - {self.wallet_type} ({self.uid})"


class WalletTransaction(models.Model):
    """
    Record of wallet transactions (debit/credit).
    Reference is important for idempotency (for external gateway refs).
    """
    TRANSACTION_TYPES = [
        ("fund", "Funding"),
        ("debit", "Debit"),
        ("credit", "Credit"),
        ("transfer", "Transfer"),
        ("withdrawal", "Withdrawal"),
        ("auto_deduct", "Auto Deduction"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("success", "Success"),
        ("failed", "Failed"),
    ]

    uid = models.CharField(max_length=32, unique=True, default=lambda: generate_uid("TXN"))
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    txn_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=18, decimal_places=2)
    reference = models.CharField(max_length=255, blank=True, null=True)  # e.g., Paystack reference
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["wallet"]),
            models.Index(fields=["reference"]),
            models.Index(fields=["txn_type"]),
        ]

    def __str__(self):
        return f"{self.txn_type} - {self.amount} ({self.status})"

    @classmethod
    def credit_wallet_idempotent(cls, wallet: "Wallet", amount, reference: str, description: str = "", txn_type: str = "fund"):
        """
        Idempotent credit: if a transaction with this reference already exists (success), do nothing.
        Returns (transaction_obj, created_bool)
        """
        if not reference:
            raise ValueError("reference is required for idempotent credit")

        # Use a DB transaction
        with transaction.atomic():
            existing = cls.objects.select_for_update().filter(reference=reference, status="success").first()
            if existing:
                return existing, False

            # If there is a pending/failed txn with same reference, still allow creating new success entry
            txn = cls.objects.create(
                wallet=wallet,
                txn_type=txn_type,
                amount=amount,
                reference=reference,
                description=description,
                status="success",
            )
            # update balances atomically
            wallet.balance = (wallet.balance or 0) + amount
            wallet.ledger_balance = (wallet.ledger_balance or 0) + amount
            wallet.save(update_fields=["balance", "ledger_balance"])
            return txn, True


class WalletSecurity(models.Model):
    """
    Wallet security features (PIN, 2FA).
    NOTE: In production store hashed/encrypted PINs, not plain text.
    """
    wallet = models.OneToOneField(Wallet, on_delete=models.CASCADE, related_name="security")
    transaction_pin_hash = models.CharField(max_length=255, blank=True)  # hashed
    two_factor_enabled = models.BooleanField(default=False)

    def __str__(self):
        return f"Security for {self.wallet}"


# --- Paystack-specific models (lightweight) ---

class PaystackCustomer(models.Model):
    """
    Minimal Paystack customer record to map our user -> paystack customer_code/id.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="paystack_customer")
    customer_code = models.CharField(max_length=128, unique=True)  # e.g., CUS_xxx from Paystack
    email = models.EmailField()
    phone = models.CharField(max_length=32, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["customer_code"]), models.Index(fields=["user"])]

    def __str__(self):
        return f"PaystackCustomer({self.customer_code}) for {self.user}"


class DedicatedVirtualAccount(models.Model):
    """
    Representation of a Paystack Dedicated Virtual Account assigned to a Wallet (customer).
    """
    wallet = models.OneToOneField(Wallet, on_delete=models.CASCADE, related_name="dedicated_account")
    paystack_id = models.CharField(max_length=128, unique=True)  # paystack dedicated_account id
    account_number = models.CharField(max_length=32)  # NUBAN
    bank_name = models.CharField(max_length=128, blank=True, null=True)
    assigned = models.BooleanField(default=True)
    currency = models.CharField(max_length=8, default="NGN")
    metadata = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["paystack_id"]), models.Index(fields=["account_number"])]

    def __str__(self):
        return f"DVA {self.account_number} ({self.bank_name}) -> {self.wallet}"
