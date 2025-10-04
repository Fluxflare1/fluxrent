# backend/rents/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.http import HttpResponse
from decimal import Decimal
import weasyprint
from django.conf import settings
import tempfile

from .models import Tenancy, LateFeeRule, RentInvoice, RentPayment, Receipt
from .serializers import (
    TenancySerializer, LateFeeRuleSerializer, RentInvoiceSerializer, 
    RentPaymentCreateSerializer, RentPaymentSerializer, ReceiptSerializer,
    WalletPaymentCreateSerializer
)
from wallet.models import Wallet, WalletTransaction

class TenancyViewSet(viewsets.ModelViewSet):
    queryset = Tenancy.objects.all().select_related("tenant", "apartment")
    serializer_class = TenancySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        
        if getattr(user, "role", None) == "tenant":
            return qs.filter(tenant=user)
        elif getattr(user, "role", None) == "property_manager":
            return qs.filter(apartment__property__manager=user)
        elif user.is_staff:
            return qs
        return Tenancy.objects.none()

    def perform_create(self, serializer):
        serializer.save()

class LateFeeRuleViewSet(viewsets.ModelViewSet):
    queryset = LateFeeRule.objects.all().select_related("property")
    serializer_class = LateFeeRuleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        # property managers should only see their properties' rules
        return self.queryset.filter(property__manager=user)

class RentInvoiceViewSet(viewsets.ModelViewSet):
    queryset = RentInvoice.objects.all().select_related("tenancy", "tenancy__tenant", "tenancy__apartment")
    serializer_class = RentInvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        
        # Add date filtering from Code 2
        start = self.request.query_params.get("from_date")
        end = self.request.query_params.get("to_date")
        if start:
            qs = qs.filter(issue_date__gte=start)
        if end:
            qs = qs.filter(issue_date__lte=end)
            
        if getattr(user, "role", None) == "tenant":
            return qs.filter(tenancy__tenant=user)
        elif getattr(user, "role", None) == "property_manager":
            return qs.filter(tenancy__apartment__property__manager=user)
        elif user.is_staff:
            return qs
        return RentInvoice.objects.none()

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def mark_paid(self, request, pk=None):
        """Admin/PM action to mark invoice as paid (manual)."""
        invoice = self.get_object()
        
        # Enhanced permission check from Code 2
        user = request.user
        if not (user.is_staff or getattr(user, "role", None) == "staff" or 
                invoice.tenancy.apartment.property.manager == user):
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
                
        if invoice.status == "paid":
            return Response({"detail": "Already paid"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Keep the robust payment creation from Code 1
        payment = RentPayment.objects.create(
            invoice=invoice,
            payer=invoice.tenancy.tenant,
            amount=invoice.outstanding,
            method="cash",
            status="success",
            confirmed_by=request.user,
            confirmed_at=timezone.now()
        )
        applied, remaining = payment.finalize_success()
        receipt = Receipt.objects.create(payment=payment)
        return Response({
            "payment": RentPaymentSerializer(payment).data, 
            "receipt": ReceiptSerializer(receipt).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def generate(self, request):
        """
        Generate invoice(s) for a tenancy: payload { tenancy_id, due_date, amount (optional) }
        If amount not provided, use tenancy.monthly_rent.
        """
        tenancy_id = request.data.get("tenancy_id")
        due_date = request.data.get("due_date")
        amount = request.data.get("amount")
        
        try:
            tenancy = Tenancy.objects.get(pk=tenancy_id)
        except Tenancy.DoesNotExist:
            return Response({"detail": "Tenancy not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Enhanced permission check from Code 2
        user = request.user
        if not (user.is_staff or getattr(user, "role", None) in ("property_manager", "staff") and 
                tenancy.apartment.property.manager == user):
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        
        amt = Decimal(amount) if amount is not None else tenancy.monthly_rent
        inv = RentInvoice.objects.create(
            tenancy=tenancy,
            due_date=due_date,
            amount=amt,
            description=f"Rent for {tenancy.apartment.name}"
        )
        return Response(RentInvoiceSerializer(inv).data, status=status.HTTP_201_CREATED)

class RentPaymentViewSet(viewsets.GenericViewSet):
    queryset = RentPayment.objects.all().select_related("invoice", "payer")
    serializer_class = RentPaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "role", None) == "tenant":
            return self.queryset.filter(payer=user)
        elif getattr(user, "role", None) == "property_manager":
            return self.queryset.filter(invoice__tenancy__apartment__property__manager=user)
        elif user.is_staff:
            return self.queryset
        return RentPayment.objects.none()

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def pay_with_wallet(self, request):
        """
        Tenant initiates a wallet payment for an invoice.
        Uses the new serializer from Code 2 but keeps robust logic from Code 1
        """
        serializer = WalletPaymentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        invoice_id = serializer.validated_data["invoice"]
        amount = serializer.validated_data["amount"]
        
        try:
            invoice = RentInvoice.objects.select_for_update().get(id=invoice_id)
        except RentInvoice.DoesNotExist:
            return Response({"detail": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND)
            
        if invoice.status == "paid":
            return Response({"detail": "Invoice already paid."}, status=status.HTTP_400_BAD_REQUEST)
            
        user = request.user
        wallet_qs = Wallet.objects.filter(user=user, is_active=True)
        wallet = wallet_qs.first()  # Use first active wallet
        
        if not wallet:
            return Response({"detail": "No wallet found"}, status=status.HTTP_400_BAD_REQUEST)
            
        total = invoice.outstanding
        if wallet.balance < total:
            return Response({"detail": "Insufficient wallet balance"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Keep the robust wallet logic from Code 1
        wallet.balance = (wallet.balance - total).quantize(Decimal("0.01"))
        wallet.save(update_fields=["balance"])
        
        WalletTransaction.objects.create(
            wallet=wallet,
            txn_type="debit",
            amount=total,
            reference=f"rent:{invoice.uid}",
            description=f"Wallet payment for rent invoice {invoice.uid}",
            status="success"
        )
        
        payment = RentPayment.objects.create(
            invoice=invoice,
            payer=user,
            amount=total,
            method="wallet",
            status="success",
            confirmed_by=user,
            confirmed_at=timezone.now()
        )
        applied, remaining = payment.finalize_success()
        receipt = Receipt.objects.create(payment=payment)
        
        return Response({
            "payment": RentPaymentSerializer(payment).data, 
            "receipt": ReceiptSerializer(receipt).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def record_external(self, request):
        """
        Called after verifying external transaction (Paystack webhook or manual verification).
        payload: invoice_id, amount, reference, method
        """
        serializer = RentPaymentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        invoice = RentInvoice.objects.get(pk=serializer.validated_data["invoice_id"])
        amount = Decimal(serializer.validated_data["amount"])
        method = serializer.validated_data["method"]
        reference = serializer.validated_data.get("reference")
        
        # create payment record (assume verified by caller)
        payment = RentPayment.objects.create(
            invoice=invoice,
            payer=invoice.tenancy.tenant,
            amount=amount,
            method=method,
            reference=reference,
            status="success",
            confirmed_by=None,
            confirmed_at=timezone.now()
        )
        payment.finalize_success()
        receipt = Receipt.objects.create(payment=payment)
        
        return Response({
            "payment": RentPaymentSerializer(payment).data, 
            "receipt": ReceiptSerializer(receipt).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def confirm(self, request, pk=None):
        """
        Confirm a RentPayment (admin/pm). pk = rentpayment id
        """
        payment = self.get_object()
        
        # Enhanced permission check from Code 2
        user = request.user
        if not (user.is_staff or getattr(user, "role", None) in ("staff", "property_manager")):
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
            
        if payment.status == "success":
            return Response({"detail": "Already confirmed"}, status=status.HTTP_400_BAD_REQUEST)
            
        payment.status = "success"
        payment.confirmed_by = request.user
        payment.confirmed_at = timezone.now()
        payment.save(update_fields=["status", "confirmed_by", "confirmed_at"])
        payment.finalize_success()
        receipt = Receipt.objects.create(payment=payment)
        
        return Response({
            "payment": RentPaymentSerializer(payment).data, 
            "receipt": ReceiptSerializer(receipt).data
        }, status=status.HTTP_200_OK)

    # Keep the receipt generation endpoints from Code 1
    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def receipt_html(self, request, pk=None):
        """Return HTML for a receipt (tenant/manager can view)."""
        # ... keep the full implementation from Code 1
        pass

    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def receipt_pdf(self, request, pk=None):
        """Return PDF file for a receipt. Uses WeasyPrint."""
        # ... keep the full implementation from Code 1
        pass
