# backend/bills/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Invoice, BillItem
from .serializers import InvoiceSerializer, BillItemSerializer
from payments.serializers import PaymentRecordSerializer
from wallet.models import Wallet, WalletTransaction
from payments.models import PaymentRecord
from django.utils.timezone import now
from rest_framework.decorators import action

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "role", None) == "tenant":
            return self.queryset.filter(tenant_apartment__tenant=user)
        elif getattr(user, "role", None) == "property_manager":
            # adjust to your property relationship - example uses owner/manager field
            return self.queryset.filter(tenant_apartment__property__owner=user)
        return Invoice.objects.none()

class BillItemViewSet(viewsets.ModelViewSet):
    queryset = BillItem.objects.all()
    serializer_class = BillItemSerializer
    permission_classes = [permissions.IsAuthenticated]

# NOTE: Payment endpoints moved to payments app. Keep bills focusing on invoices/items.
# If you still want quick proxy endpoints in bills to call payments, implement thin wrappers here.
