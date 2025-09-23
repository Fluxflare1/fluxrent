import uuid
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


def generate_uid(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"


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

    uid = models.CharField(max_length=20, unique=True, default=lambda: generate_uid("WAL"))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wallets")
    wallet_type = models.CharField(max_length=30, choices=WALLET_TYPES)
    account_number = models.CharField(max_length=20, unique=True, blank=True, null=True)  # via Paystack DVA
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    ledger_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # incl. pending txns
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.wallet_type} ({self.uid})"


class WalletTransaction(models.Model):
    """
    Record of wallet transactions (debit/credit).
    """
    TRANSACTION_TYPES = [
        ("fund", "Funding"),
        ("debit", "Debit"),
        ("credit", "Credit"),
        ("transfer", "Transfer"),
        ("withdrawal", "Withdrawal"),
        ("auto_deduct", "Auto Deduction"),
    ]

    uid = models.CharField(max_length=20, unique=True, default=lambda: generate_uid("TXN"))
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    txn_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=100, blank=True, null=True)  # e.g., Paystack ref
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("success", "Success"), ("failed", "Failed")],
        default="pending",
    )

    def __str__(self):
        return f"{self.txn_type} - {self.amount} ({self.status})"


class WalletSecurity(models.Model):
    """
    Wallet security features (PIN, 2FA).
    """
    wallet = models.OneToOneField(Wallet, on_delete=models.CASCADE, related_name="security")
    transaction_pin = models.CharField(max_length=6)  # stored encrypted in real setup
    two_factor_enabled = models.BooleanField(default=False)

    def __str__(self):
        return f"Security for {self.wallet}"
