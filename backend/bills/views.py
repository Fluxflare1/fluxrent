# backend/bills/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Invoice, BillItem
from .serializers import InvoiceSerializer, BillItemSerializer
from payments.serializers import PaymentRecordSerializer
from wallet.models import Wallet, WalletTransaction
from payments.models import PaymentRecord
from rest_framework.decorators import action
from django.db import transaction
from django.shortcuts import get_object_or_404

class IsPropertyManagerOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.is_staff or getattr(request.user, "role", None) == "property_manager")

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().prefetch_related("items", "payments")
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsPropertyManagerOrStaff]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        # tenant sees own invoices
        if getattr(user, "role", None) == "tenant":
            return qs.filter(tenant_apartment__tenant=user)
        # property_manager sees invoices for properties they manage/own
        if getattr(user, "role", None) == "property_manager" and not user.is_staff:
            return qs.filter(tenant_apartment__apartment__property__manager=user)
        # staff see all
        if user.is_staff:
            return qs
        return Invoice.objects.none()

    def perform_create(self, serializer):
        # extra permission validation: ensure manager owns property for tenant_apartment
        tenant_apartment = serializer.validated_data.get("tenant_apartment")
        user = self.request.user
        # If not staff, ensure property manager manages/owns
        if not user.is_staff:
            prop = getattr(getattr(tenant_apartment, "apartment", None), "property", None)
            if prop is None or getattr(prop, "manager", None) != user:
                raise permissions.PermissionDenied("You do not manage that property / tenant.")
        serializer.save()

    def perform_update(self, serializer):
        # permission check similar to create
        tenant_apartment = serializer.validated_data.get("tenant_apartment", None)
        user = self.request.user
        if tenant_apartment and not user.is_staff:
            prop = getattr(getattr(tenant_apartment, "apartment", None), "property", None)
            if prop is None or getattr(prop, "manager", None) != user:
                raise permissions.PermissionDenied("You do not manage that property / tenant.")
        serializer.save()

class BillItemViewSet(viewsets.ModelViewSet):
    queryset = BillItem.objects.all().select_related("invoice")
    serializer_class = BillItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsPropertyManagerOrStaff]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if getattr(user, "role", None) == "tenant":
            return qs.filter(invoice__tenant_apartment__tenant=user)
        if getattr(user, "role", None) == "property_manager" and not user.is_staff:
            return qs.filter(invoice__tenant_apartment__apartment__property__manager=user)
        if user.is_staff:
            return qs
        return BillItem.objects.none()
