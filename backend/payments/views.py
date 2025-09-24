# backend/payments/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils.timezone import now
from decimal import Decimal

from .models import PaymentRecord
from .serializers import PaymentRecordSerializer, ApplyPrepaymentSerializer
from bills.models import Invoice
from wallet.models import Wallet, WalletTransaction

# simple permission check; adjust to your role system
class IsPropertyManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return getattr(request.user, "role", None) == "property_manager" or request.user.is_staff


class PaymentRecordViewSet(viewsets.ModelViewSet):
    """
    Manage PaymentRecords.
    - create prepayments by POST with invoice omitted.
    - pay_with_wallet: wallet -> invoice (deduct + create record + reconcile)
    - confirm_cash: PM confirms invoice paid outside the system (cash/bank)
    - apply_prepayment: allocate a prepayment to target invoice
    - statement: tenant-level statement (invoices + payments summary)
    - verify_external: record/verify gateway payments (used by webhook or manual)
    """
    queryset = PaymentRecord.objects.all().select_related("invoice", "tenant", "confirmed_by")
    serializer_class = PaymentRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, "role", None)
        if role == "tenant":
            return self.queryset.filter(tenant=user)
        if role == "property_manager":
            # filter payments for properties the PM owns/manages.
            # adjust lookup to match your property-apartment ownership fields
            return self.queryset.filter(invoice__tenant_apartment__apartment__property__owner=user)
        # superuser / staff see all
        if user.is_staff or user.is_superuser:
            return self.queryset
        return self.queryset.none()

    def perform_create(self, serializer):
        # When creating via standard POST, assign tenant=request.user and default status to success
        serializer.save(tenant=self.request.user, status=serializer.validated_data.get("status", "success"))

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def pay_with_wallet(self, request, pk=None):
        """
        Tenant pays invoice using their wallet.
        pk = invoice pk.
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

        total = Decimal(invoice.total_amount)
        if Decimal(wallet.balance) < total:
            return Response({"error": "Insufficient wallet balance."}, status=status.HTTP_400_BAD_REQUEST)

        # Deduct funds
        wallet.balance = Decimal(wallet.balance) - total
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
        # Reconcile
        payment.mark_invoice_paid_if_fully_settled()
        serializer = PaymentRecordSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsPropertyManager])
    @transaction.atomic
    def confirm_cash(self, request, pk=None):
        """
        Property Manager confirms a cash/bank payment for an invoice.
        pk is invoice id.
        """
        user = request.user
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
        payment.mark_invoice_paid_if_fully_settled()
        return Response(PaymentRecordSerializer(payment).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def create_prepayment(self, request):
        """
        Create a prepayment (advance) not attached to any invoice.
        Example payload: { "amount": 5000, "method": "bank", "reference": "ABC123" }
        This endpoint records the payment and should be called after wallet funding confirmation or gateway webhook.
        """
        data = request.data.copy()
        data["invoice"] = None
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        # save tenant as current user
        payment = serializer.save(tenant=request.user, status="success", confirmed_at=now())
        return Response(self.get_serializer(payment).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def apply_prepayment(self, request):
        """
        Apply an existing prepayment to a target invoice.
        payload: { prepayment_id, invoice_id, amount (optional) }
        """
        serializer = ApplyPrepaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pre = PaymentRecord.objects.get(pk=serializer.validated_data["prepayment_id"])
        invoice = Invoice.objects.get(pk=serializer.validated_data["invoice_id"])
        amount = serializer.validated_data.get("amount", None)

        try:
            applied, remainder = pre.apply_to_invoice(invoice, amount=amount)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        # After applying, ensure invoice reconciliation
        applied.mark_invoice_paid_if_fully_settled()
        return Response({
            "applied": PaymentRecordSerializer(applied).data,
            "remainder_prepayment": PaymentRecordSerializer(remainder).data if remainder else None
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def statement(self, request):
        """
        Tenant-level statement of account:
        - lists invoices for the tenant (or for property manager's tenants)
        - for each invoice: total_amount, sum_paid, outstanding
        - returns totals: total_due, total_paid, total_outstanding
        Query params:
        - ?tenant_id= (only for PM / staff); otherwise tenant is request.user
        """
        user = request.user
        tenant_id = request.query_params.get("tenant_id")
        role = getattr(user, "role", None)

        if tenant_id:
            # only PM/staff allowed to query other tenants
            if not (user.is_staff or user.is_superuser or role == "property_manager"):
                return Response({"error": "Not permitted to query other tenants."}, status=status.HTTP_403_FORBIDDEN)
            try:
                target_tenant = None
                # find tenant's user object from id
                from django.contrib.auth import get_user_model
                User = get_user_model()
                target_tenant = User.objects.get(pk=tenant_id)
            except Exception:
                return Response({"error": "Tenant not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            target_tenant = user

        # gather invoices for this tenant via TenantApartment relationship
        invoices = Invoice.objects.filter(tenant_apartment__tenant=target_tenant).order_by("-issued_at")
        statement = []
        total_due = Decimal("0")
        total_paid = Decimal("0")
        total_outstanding = Decimal("0")

        for inv in invoices:
            paid_sum = PaymentRecord.objects.filter(invoice=inv, status="success").aggregate(total=models.Sum("amount"))["total"] or Decimal("0")
            outstanding = Decimal(inv.total_amount) - Decimal(paid_sum)
            statement.append({
                "invoice_id": inv.id,
                "invoice_uid": inv.uid,
                "type": inv.type,
                "issued_at": inv.issued_at,
                "due_date": inv.due_date,
                "total_amount": str(inv.total_amount),
                "paid": str(paid_sum),
                "outstanding": str(outstanding if outstanding > 0 else Decimal("0")),
                "is_paid": inv.is_paid,
            })
            total_due += Decimal(inv.total_amount)
            total_paid += Decimal(paid_sum)
            total_outstanding += (outstanding if outstanding > 0 else Decimal("0"))

        return Response({
            "tenant": getattr(target_tenant, "id", None),
            "summary": {
                "total_due": str(total_due),
                "total_paid": str(total_paid),
                "total_outstanding": str(total_outstanding)
            },
            "invoices": statement
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def verify_external(self, request):
        """
        Record an external gateway payment after verifying with gateway (or called by webhook).
        payload: invoice_id, reference, amount, method (card/bank/external_gateway)
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

        # TODO: Replace with a proper call to the gateway verify API.
        verified = True
        if not verified:
            return Response({"error": "External verification failed."}, status=status.HTTP_400_BAD_REQUEST)

        payment = PaymentRecord.objects.create(
            invoice=invoice,
            tenant=invoice.tenant_apartment.tenant,
            amount=Decimal(amount),
            method=method,
            reference=reference,
            status="success",
            confirmed_by=None,
            confirmed_at=now()
        )
        payment.mark_invoice_paid_if_fully_settled()
        return Response(PaymentRecordSerializer(payment).data, status=status.HTTP_201_CREATED)
