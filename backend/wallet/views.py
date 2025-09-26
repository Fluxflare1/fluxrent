from django.contrib.auth import authenticate
from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Wallet, WalletTransaction, WalletSecurity, StandingOrder
from .serializers import WalletSerializer, WalletTransactionSerializer, WalletSecuritySerializer, StandingOrderSerializer


class WalletViewSet(viewsets.ModelViewSet):
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Wallet.objects.all()
        return Wallet.objects.filter(user=user)

    @action(detail=False, methods=["get"])
    def cluster_by_type(self, request):
        """
        Group wallet balances by wallet_type (personal, business, etc.)
        """
        qs = (
            self.get_queryset()
            .values("wallet_type")
            .annotate(
                total_balance=Sum("balance"),
                wallet_count=Count("id"),
                average_balance=Avg("balance")
            )
            .order_by("wallet_type")
        )
        return Response(qs)

    @action(detail=False, methods=["post"])
    def validate(self, request):
        """
        Validate wallet transaction with OTP, PIN, or Password
        """
        user = request.user
        method = request.data.get("method")
        value = request.data.get("value")
        action_type = request.data.get("action")

        if not method or not value:
            return Response({"error": "Missing method or value"}, status=status.HTTP_400_BAD_REQUEST)

        if method == "password":
            if authenticate(username=user.username, password=value):
                return Response({"success": True, "message": f"{action_type} validated"})
            return Response({"success": False, "message": "Invalid password"}, status=401)

        elif method == "pin":
            if hasattr(user, "profile") and user.profile.wallet_pin == value:
                return Response({"success": True, "message": f"{action_type} validated"})
            return Response({"success": False, "message": "Invalid PIN"}, status=401)

        elif method == "otp":
            # TODO: Integrate with your OTP service
            if hasattr(user, "profile") and user.profile.otp_code == value:
                return Response({"success": True, "message": f"{action_type} validated"})
            return Response({"success": False, "message": "Invalid OTP"}, status=401)

        return Response({"error": "Unsupported validation method"}, status=400)

    @action(detail=False, methods=["post"])
    def fund_confirm(self, request):
        """
        Confirm payment transaction and credit wallet
        """
        reference = request.data.get("reference")
        amount = request.data.get("amount")
        wallet_id = request.data.get("wallet_id")

        if not all([reference, amount, wallet_id]):
            return Response({"error": "Missing required parameters"}, status=400)

        try:
            wallet = Wallet.objects.get(id=wallet_id, user=request.user)
        except Wallet.DoesNotExist:
            return Response({"error": "Wallet not found"}, status=404)

        with transaction.atomic():
            wallet.balance += float(amount)
            wallet.save()

            WalletTransaction.objects.create(
                wallet=wallet,
                amount=amount,
                txn_type="credit",
                reference=reference,
                description="Wallet funding"
            )

        return Response({"success": True, "message": "Wallet funded successfully"})

    @action(detail=False, methods=["post"])
    def transfer(self, request):
        """
        Transfer funds between wallets
        """
        sender = request.user
        recipient_identifier = request.data.get("recipient")
        amount = float(request.data.get("amount", 0))

        if amount <= 0:
            return Response({"error": "Invalid amount"}, status=400)

        try:
            sender_wallet = Wallet.objects.get(user=sender)
            recipient_wallet = Wallet.objects.get(wallet_number=recipient_identifier)
        except Wallet.DoesNotExist:
            return Response({"error": "Wallet not found"}, status=404)

        if sender_wallet.balance < amount:
            return Response({"error": "Insufficient balance"}, status=400)

        with transaction.atomic():
            sender_wallet.balance -= amount
            recipient_wallet.balance += amount
            sender_wallet.save()
            recipient_wallet.save()

            # Create transaction records
            WalletTransaction.objects.create(
                wallet=sender_wallet,
                amount=amount,
                txn_type="debit",
                reference=f"TRF-{recipient_wallet.wallet_number}",
                description="Fund transfer"
            )
            WalletTransaction.objects.create(
                wallet=recipient_wallet,
                amount=amount,
                txn_type="credit",
                reference=f"TRF-{sender_wallet.wallet_number}",
                description="Fund transfer"
            )

        return Response({"success": True, "message": "Transfer completed successfully"})


class WalletTransactionViewSet(viewsets.ModelViewSet):
    queryset = WalletTransaction.objects.all()
    serializer_class = WalletTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at", "amount"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return WalletTransaction.objects.filter(wallet__user=self.request.user)

    @action(detail=False, methods=["get"])
    def cluster_by_type(self, request):
        """
        Aggregate transactions grouped by transaction type
        """
        qs = (
            self.get_queryset()
            .values("txn_type")
            .annotate(
                total=Sum("amount"),
                transaction_count=Count("id"),
                average_amount=Avg("amount")
            )
            .order_by("txn_type")
        )
        return Response(qs)

    @action(detail=False, methods=["get"])
    def cluster_by_month(self, request):
        """
        Aggregate transactions grouped by month
        """
        qs = (
            self.get_queryset()
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(
                total=Sum("amount"),
                transaction_count=Count("id"),
                average_amount=Avg("amount")
            )
            .order_by("month")
        )
        return Response(qs)


class WalletSecurityViewSet(viewsets.ModelViewSet):
    queryset = WalletSecurity.objects.all()
    serializer_class = WalletSecuritySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(wallet__user=self.request.user)


class StandingOrderViewSet(viewsets.ModelViewSet):
    queryset = StandingOrder.objects.all()
    serializer_class = StandingOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(wallet__user=self.request.user)
