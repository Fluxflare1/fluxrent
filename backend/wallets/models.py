import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class Wallet(models.Model):
    CURRENCY_CHOICES = [
        ("NGN", "Nigerian Naira"),
        ("USD", "US Dollar"),
    ]
    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("SUSPENDED", "Suspended"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=10, choices=CURRENCY_CHOICES, default="NGN")
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="ACTIVE")
    customer_code = models.CharField(max_length=100, blank=True, null=True)  # Paystack customer
    dva_account_number = models.CharField(max_length=20, blank=True, null=True)
    dva_bank_name = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wallet({self.user.username} - {self.balance} {self.currency})"


class WalletTransaction(models.Model):
    TYPE_CHOICES = [
        ("CREDIT", "Credit"),
        ("DEBIT", "Debit"),
    ]
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    source = models.CharField(max_length=50)  # CARD, DVA, P2P, BILL, etc.
    reference = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} {self.amount} {self.wallet.user.username}"


class SavingsPlan(models.Model):
    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="savings_plans")
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    interval = models.CharField(max_length=20, choices=[("DAILY", "Daily"), ("WEEKLY", "Weekly"), ("MONTHLY", "Monthly")])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ACTIVE")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def deposit(self, amount):
        self.current_balance += amount
        if self.current_balance >= self.target_amount:
            self.status = "COMPLETED"
        self.save()

    def withdraw(self, amount):
        if amount > self.current_balance:
            raise ValueError("Insufficient savings balance")
        self.current_balance -= amount
        self.save()

    def __str__(self):
        return f"SavingsPlan({self.wallet.user.username} - {self.current_balance}/{self.target_amount})"
