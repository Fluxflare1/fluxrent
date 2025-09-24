# backend/payments/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils.timezone import now

from .models import PaymentRecord
from .serializers import PaymentRecordSerializer
from bills.models import Invoice
from wallet.models import Wallet, WalletTransaction

class IsPropertyManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return getattr(request.user, "role", None) == "property_manager" or request.user.is_staff

class PaymentRecordViewSet(viewsets.ModelViewSet):
    """
    Manage PaymentRecords (create via API when confirming cash, recording external payments,
    or when Wallet payments create audit records).
    """
    queryset = PaymentRecord.objects.all().select_related("invoice", "tenant", "confirmed_by")
    serializer_class = PaymentRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "role", None) == "tenant":
            return self.queryset.filter(tenant=user)
        if getattr(user, "role", None) == "property_manager":
            # show payments for invoices on properties they manage
            return self.queryset.filter(invoice__tenant_apartment__apartment__property__owner=user)  # adjust field as per your property ownership
        return self.queryset.none()

    def perform_create(self, serializer):
        # set tenant to request.user (caller)
        serializer.save(tenant=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsPropertyManager])
    @transaction.atomic
    def confirm_cash(self, request, pk=None):
        """
        Property Manager confirms a cash/bank payment for an invoice.
        Creates a PaymentRecord with method 'cash' or 'bank' and marks invoice as paid if fully settled.
        """
        user = request.user
        invoice = self.get_object().invoice if isinstance(self.get_object(), PaymentRecord) else None

        # Better: pk refers to invoice id; support both usages
        try:
            invoice = Invoice.objects.get(pk=pk)
        except Invoice.DoesNotExist:
            return Response({"error": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND)

        if invoice.is_paid:
            return Response({"error": "Invoice already paid."}, status=status.HTTP_400_BAD_REQUEST)

        amount = invoice.total_amount
        payment = PaymentRecord.objects.create(
            invoice=invoice,
            tenant=invoice.tenant_apartment.tenant,
            amount=amount,
            method="cash",
            status="success",
            confirmed_by=user,
            confirmed_at=now(),
        )
        # mark invoice status if fully paid
        payment.mark_invoice_paid_if_fully_settled()
        serializer = PaymentRecordSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def pay_with_wallet(self, request, pk=None):
        """
        Tenant pays invoice using their wallet. This endpoint deducts wallet, logs a WalletTransaction,
        creates a PaymentRecord, and marks invoice as paid when fully settled.
        pk here is invoice pk.
        """
        user = request.user
        try:
            invoice = Invoice.objects.get(pk=pk)
        except Invoice.DoesNotExist:
            return Response({"error": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND)

        if invoice.is_paid:
            return Response({"error": "Invoice already paid."}, status=status.HTTP_400_BAD_REQUEST)

        wallet = Wallet.objects.filter(user=user, is_active=True).first()
        if not wallet:
            return Response({"error": "No active wallet found for user."}, status=status.HTTP_400_BAD_REQUEST)

        total = float(invoice.total_amount)
        if float(wallet.balance) < total:
            return Response({"error": "Insufficient wallet balance."}, status=status.HTTP_400_BAD_REQUEST)

        # Deduct, create wallet transaction, then PaymentRecord
        wallet.balance = wallet.balance - total
        wallet.save(update_fields=["balance"])

        WalletTransaction.objects.create(
            wallet=wallet,
            txn_type="debit",
            amount=total,
            reference=None,
            description=f"Wallet payment for Invoice {invoice.uid}",
            status="success",
        )

        payment = PaymentRecord.objects.create(
            invoice=invoice,
            tenant=user,
            amount=total,
            method="wallet_manual",
            status="success",
            confirmed_by=user,
            confirmed_at=now(),
        )
        payment.mark_invoice_paid_if_fully_settled()
        serializer = PaymentRecordSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def verify_external(self, request):
        """
        Example endpoint to record/verify an external (gateway) payment.
        Expected payload: invoice_id, reference, amount, method (card/bank/external_gateway)
        This endpoint should be called after external provider verification (or from webhook).
        """
        invoice_id = request.data.get("invoice_id")
        reference = request.data.get("reference")
        amount = request.data.get("amount")
        method = request.data.get("method", "external_gateway")
        if not invoice_id or not reference or not amount:
            return Response({"error": "invoice_id, reference and amount are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            invoice = Invoice.objects.get(pk=invoice_id)
        except Invoice.DoesNotExist:
            return Response({"error": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND)

        if invoice.is_paid:
            return Response({"error": "Invoice already paid."}, status=status.HTTP_400_BAD_REQUEST)

        # TODO: call external gateway to verify reference -> simulated as 'verified'
        verified = True
        if not verified:
            return Response({"error": "External verification failed."}, status=status.HTTP_400_BAD_REQUEST)

        payment = PaymentRecord.objects.create(
            invoice=invoice,
            tenant=invoice.tenant_apartment.tenant,
            amount=amount,
            method=method,
            reference=reference,
            status="success",
            confirmed_by=None,
            confirmed_at=now()
        )
        payment.mark_invoice_paid_if_fully_settled()
        return Response(PaymentRecordSerializer(payment).data, status=status.HTTP_201_CREATED)
