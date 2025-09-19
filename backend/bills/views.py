from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone

from .models import BillType, Bill, Invoice, InvoiceLine, Payment
from .serializers import (
    BillTypeSerializer,
    BillSerializer,
    InvoiceSerializer,
    InvoiceLineSerializer,
    PaymentSerializer,
)
from .permissions import IsAdminOrReadOnly, IsInvoiceRelatedParty

# Import for the new wallet payment feature
from wallets.models import Wallet, WalletTransaction
from .services import pay_invoice_with_wallet


# Custom PM-only permission
class IsPropertyManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "PROPERTY_MANAGER"


class BillTypeViewSet(viewsets.ModelViewSet):
    """Admin-only: Manage Bill Types (Rent, Utilities, etc.)"""
    queryset = BillType.objects.all()
    serializer_class = BillTypeSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]


class BillViewSet(viewsets.ModelViewSet):
    """Admin-only: Manage Bills across all properties"""
    queryset = Bill.objects.select_related("apartment", "bill_type").all()
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        apartment = self.request.query_params.get("apartment")
        if apartment:
            qs = qs.filter(apartment__id=apartment)
        return qs


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    Hybrid ViewSet: 
    - Admins/Property Managers: Full access to all invoices
    - Tenants: Read-only access to their own invoices + ability to pay
    """
    queryset = Invoice.objects.select_related("tenant_apartment").prefetch_related("lines", "payments").all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Tenants see only their invoices; Admins see all"""
        user = self.request.user
        if user.role in ['ADMIN', 'PROPERTY_MANAGER', 'PM'] or user.is_staff:
            return self.queryset  # Admins see everything
        return Invoice.objects.filter(tenant_apartment__tenant=user)  # Tenants see only their own

    def get_permissions(self):
        """Different permissions for different actions"""
        if self.action in ("retrieve", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsInvoiceRelatedParty()]
        if self.action in ("issue", "mark_paid", "confirm_manual_payment"):
            return [IsAuthenticated(), IsAdminOrReadOnly()]
        if self.action == "pay":
            return [IsAuthenticated(), IsInvoiceRelatedParty()]  # Only tenant can pay their own invoice
        return [IsAuthenticated()]

    # ===== ADMIN/PROPERTY MANAGER ACTIONS =====
    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrReadOnly])
    def issue(self, request, pk=None):
        """Admin-only: Issue a draft invoice"""
        invoice = self.get_object()
        if invoice.status != Invoice.STATUS_DRAFT:
            return Response({"detail": "Invoice already issued or not in draft"}, status=status.HTTP_400_BAD_REQUEST)
        invoice.status = Invoice.STATUS_ISSUED
        if not invoice.issue_date:
            invoice.issue_date = timezone.now().date()
        invoice.save(update_fields=["status", "issue_date"])
        return Response({"status": "issued", "invoice_no": invoice.invoice_no})

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrReadOnly])
    def mark_paid(self, request, pk=None):
        """Admin-only: Manually mark invoice as paid"""
        invoice = self.get_object()
        ref = request.data.get("payment_ref") or f"manual-{timezone.now().timestamp()}"
        amount = request.data.get("amount") or invoice.total_amount
        payment = Payment.objects.create(
            invoice=invoice, 
            payment_ref=ref, 
            amount=amount, 
            method=request.data.get("method", "bank"), 
            status=Payment.STATUS_CONFIRMED, 
            paid_at=timezone.now()
        )
        invoice.recalc_totals()
        return Response({"status": "marked_paid", "payment_id": payment.id})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsPropertyManager])
    def confirm_manual_payment(self, request, pk=None):
        """
        Property Manager manually confirms invoice as paid outside Wallet.
        This is for payments made via bank transfer, cash, or other external methods.
        """
        invoice = self.get_object()
        
        if invoice.status == Invoice.STATUS_PAID:
            return Response({"detail": "Invoice already marked as paid"}, status=status.HTTP_400_BAD_REQUEST)

        payment_method = request.data.get("method", "BANK_TRANSFER")
        
        # Use the model method to handle the confirmation
        try:
            invoice.confirm_manual_payment(
                user=request.user,
                payment_method=payment_method,
                confirmed_at=timezone.now()
            )
            
            # Log into WalletTransaction (for audit only, not linked to tenant wallet balance)
            WalletTransaction.objects.create(
                wallet=None,  # not deducted from wallet
                amount=invoice.total_amount,
                type="CREDIT",
                source=f"MANUAL_CONFIRM_{payment_method}",
                reference=f"INV-MANUAL-{invoice.id}",
                status="SUCCESS",
            )

            return Response(
                {
                    "detail": f"Invoice {invoice.invoice_no} confirmed as paid manually via {payment_method}",
                    "invoice_status": invoice.status,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"detail": f"Error confirming payment: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    # ===== TENANT ACTIONS =====
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsInvoiceRelatedParty])
    def pay(self, request, pk=None):
        """
        Tenant-only: Pay invoice using wallet balance
        """
        invoice = self.get_object()
        
        # Additional permission check (redundant but safe)
        if not IsInvoiceRelatedParty().has_object_permission(request, self, invoice):
            return Response({"detail": "Not authorized to pay this invoice"}, status=status.HTTP_403_FORBIDDEN)

        try:
            wallet = Wallet.objects.get(user=request.user)
        except Wallet.DoesNotExist:
            return Response({"detail": "Wallet not found. Please contact support."}, status=status.HTTP_404_NOT_FOUND)

        try:
            payment = pay_invoice_with_wallet(invoice, wallet)
            return Response({
                "detail": "Invoice paid successfully",
                "payment_id": payment.id,
                "new_balance": wallet.balance
            }, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": "Payment processing failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentViewSet(viewsets.ModelViewSet):
    """Payment management - Admins manage, Tenants can create payments"""
    queryset = Payment.objects.select_related("invoice").all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ("create",):
            return [IsAuthenticated()]  # Tenants can create payments
        return [IsAuthenticated(), IsAdminOrReadOnly()]  # Only admins can list/view/update

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrReadOnly])
    def confirm(self, request, pk=None):
        """Admin-only: Confirm a payment"""
        payment = self.get_object()
        if payment.status == Payment.STATUS_CONFIRMED:
            return Response({"detail": "Payment already confirmed"}, status=status.HTTP_400_BAD_REQUEST)
        payment.confirm()
        return Response({"status": "confirmed", "payment_ref": payment.payment_ref})
