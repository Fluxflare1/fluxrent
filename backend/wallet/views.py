from rest_framework import viewsets, permissions
from .models import Wallet, WalletTransaction, WalletSecurity
from .serializers import WalletSerializer, WalletTransactionSerializer, WalletSecuritySerializer


class WalletViewSet(viewsets.ModelViewSet):
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # User can only see own wallets
        return self.queryset.filter(user=self.request.user)


class WalletTransactionViewSet(viewsets.ModelViewSet):
    queryset = WalletTransaction.objects.all()
    serializer_class = WalletTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Restrict to transactions from user wallets
        return self.queryset.filter(wallet__user=self.request.user)


class WalletSecurityViewSet(viewsets.ModelViewSet):
    queryset = WalletSecurity.objects.all()
    serializer_class = WalletSecuritySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(wallet__user=self.request.user)
