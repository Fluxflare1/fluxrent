from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework import viewsets, filters, permissions
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
        qs = (
            self.get_queryset()
            .values("wallet_type")
            .annotate(total_balance=Sum("balance"))
            .order_by("wallet_type")
        )
        return Response(qs)

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
        qs = (
            self.get_queryset()
            .values("txn_type")
            .annotate(total=Sum("amount"))
            .order_by("txn_type")
        )
        return Response(qs)

    @action(detail=False, methods=["get"])
    def cluster_by_month(self, request):
        qs = (
            self.get_queryset()
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Sum("amount"))
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
