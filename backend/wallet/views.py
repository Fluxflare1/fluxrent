from django.contrib.auth import authenticate
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
    permission_classes = [permissions.IsAuthenticated]  # Keep permissions

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Wallet.objects.all()
        return Wallet.objects.filter(user=user)

    # KEEP clustering feature
    @action(detail=False, methods=["get"])
    def cluster_by_type(self, request):
        qs = (
            self.get_queryset()
            .values("wallet_type")
            .annotate(total_balance=Sum("balance"))
            .order_by("wallet_type")
        )
        return Response(qs)

    # ADD new validation feature
    @action(detail=False, methods=["post"])
    def validate(self, request):
        """
        Validate wallet transaction with OTP, PIN, or Password.
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
            # TODO: integrate actual OTP provider
            if hasattr(user, "profile") and user.profile.otp_code == value:
                return Response({"success": True, "message": f"{action_type} validated"})
            return Response({"success": False, "message": "Invalid OTP"}, status=401)

        return Response({"error": "Unsupported validation method"}, status=400)

# Keep the rest of your ViewSets unchanged...
class WalletTransactionViewSet(viewsets.ModelViewSet):
    # ... (keep existing transaction code)

class WalletSecurityViewSet(viewsets.ModelViewSet):
    # ... (keep existing)

class StandingOrderViewSet(viewsets.ModelViewSet):
    # ... (keep existing)
