from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import WalletTransaction
from .serializers import WalletTransactionSerializer


class WalletTransactionViewSet(viewsets.ModelViewSet):
    queryset = WalletTransaction.objects.all()
    serializer_class = WalletTransactionSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at", "amount"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """
        Restrict queryset to transactions belonging to the logged-in user only.
        """
        return WalletTransaction.objects.filter(wallet__user=self.request.user)

    @action(detail=False, methods=["get"])
    def cluster_by_type(self, request):
        """
        Aggregate transactions grouped by txn_type.
        Example response:
        [
          {"txn_type": "funding", "total": "1000.00"},
          {"txn_type": "rent", "total": "450.00"}
        ]
        """
        qs = (
            self.get_queryset()
            .values("txn_type")
            .annotate(total=Sum("amount"))
            .order_by("txn_type")
        )
        return Response(qs)

    @action(detail=False, methods=["get"])
    def cluster_by_month(self, request):
        """
        Aggregate transactions grouped by month.
        Example response:
        [
          {"month": "2025-01-01", "total": "500.00"},
          {"month": "2025-02-01", "total": "1200.00"}
        ]
        """
        qs = (
            self.get_queryset()
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )
        return Response(qs)
