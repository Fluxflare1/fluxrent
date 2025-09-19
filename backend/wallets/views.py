import uuid
from decimal import Decimal
from django.db import transaction
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Wallet, WalletTransaction, SavingsPlan
from .serializers import WalletSerializer, WalletTransactionSerializer, SavingsPlanSerializer


class WalletDetailView(generics.RetrieveAPIView):
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.wallet


class WalletTransactionsView(generics.ListAPIView):
    serializer_class = WalletTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WalletTransaction.objects.filter(wallet=self.request.user.wallet).order_by("-created_at")


class WalletFundView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        For now: mock funding logic (Paystack integration to be added).
        """
        amount = Decimal(request.data.get("amount", 0))
        if amount <= 0:
            return Response({"detail": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        wallet = request.user.wallet
        with transaction.atomic():
            wallet.balance += amount
            wallet.save()

            WalletTransaction.objects.create(
                wallet=wallet,
                amount=amount,
                type="CREDIT",
                source="MANUAL",
                reference=str(uuid.uuid4()),
                status="SUCCESS",
            )
        return Response({"detail": "Wallet funded successfully", "balance": wallet.balance})


class WalletTransferView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = Decimal(request.data.get("amount", 0))
        recipient_id = request.data.get("recipient_id")

        if amount <= 0:
            return Response({"detail": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            recipient_wallet = Wallet.objects.get(user_id=recipient_id)
        except Wallet.DoesNotExist:
            return Response({"detail": "Recipient wallet not found"}, status=status.HTTP_404_NOT_FOUND)

        sender_wallet = request.user.wallet
        if sender_wallet.balance < amount:
            return Response({"detail": "Insufficient funds"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            sender_wallet.balance -= amount
            recipient_wallet.balance += amount
            sender_wallet.save()
            recipient_wallet.save()

            WalletTransaction.objects.create(
                wallet=sender_wallet,
                amount=amount,
                type="DEBIT",
                source="P2P",
                reference=str(uuid.uuid4()),
                status="SUCCESS",
            )
            WalletTransaction.objects.create(
                wallet=recipient_wallet,
                amount=amount,
                type="CREDIT",
                source="P2P",
                reference=str(uuid.uuid4()),
                status="SUCCESS",
            )

        return Response({"detail": "Transfer successful"})


class SavingsPlanCreateView(generics.CreateAPIView):
    serializer_class = SavingsPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(wallet=self.request.user.wallet)


class SavingsPlanDepositView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            plan = SavingsPlan.objects.get(pk=pk, wallet=request.user.wallet)
        except SavingsPlan.DoesNotExist:
            return Response({"detail": "Savings plan not found"}, status=status.HTTP_404_NOT_FOUND)

        amount = Decimal(request.data.get("amount", 0))
        if amount <= 0:
            return Response({"detail": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        plan.deposit(amount)
        return Response({"detail": "Deposit successful", "current_balance": plan.current_balance})


class SavingsPlanWithdrawView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            plan = SavingsPlan.objects.get(pk=pk, wallet=request.user.wallet)
        except SavingsPlan.DoesNotExist:
            return Response({"detail": "Savings plan not found"}, status=status.HTTP_404_NOT_FOUND)

        amount = Decimal(request.data.get("amount", 0))
        if amount <= 0:
            return Response({"detail": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan.withdraw(amount)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Withdraw successful", "current_balance": plan.current_balance})
