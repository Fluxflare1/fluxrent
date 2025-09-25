from decimal import Decimal
from django.db import transaction
from django.utils.timezone import now
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q

from .models import PaymentRecord, Prepayment, PaymentAllocation
from .serializers import PaymentRecordSerializer, ApplyPrepaymentSerializer, PrepaymentSerializer, PaymentAllocationSerializer
from bills.models import Invoice
from wallet.models import Wallet, WalletTransaction


class IsPropertyManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return getattr(request.user, "role", None) == "property_manager" or request.user.is_staff


class PaymentRecordViewSet(viewsets.ModelViewSet):
    """
    Manage PaymentRecords with enhanced prepayment system.
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
            return self.queryset.filter(invoice__tenant_apartment__apartment__property__owner=user)
        if user.is_staff or user.is_superuser:
            return self.queryset
        return self.queryset.none()

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user, status=serializer.validated_data.get("status", "success"))

    # === PREPAYMENT ENDPOINTS ===
    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def create_prepayment(self, request):
        """
        Create a prepayment (credit) for the requesting user.
        Payload: { "amount": "1000.00", "reference": "ext-ref-123" }
        """
        user = request.user
        amount = request.data.get("amount")
        reference = request.data.get("reference", None)
        
        try:
            amount = Decimal(str(amount))
        except Exception:
            return Response({"error": "Invalid amount."}, status=status.HTTP_400_BAD_REQUEST)
            
        if amount <= Decimal("0.00"):
            return Response({"error": "Amount must be positive."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            pre = Prepayment.objects.create(
                tenant=user,
                amount=amount,
                remaining=amount,
                reference=reference
            )
            
        return Response(
            {
                "message": "Prepayment created", 
                "prepayment": PrepaymentSerializer(pre).data
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def apply_prepayment(self, request):
        """
        Apply a prepayment to an invoice.
        Payload: { "prepayment_id": int, "invoice_id": int, "amount": "100.00" }
        """
        user = request.user
        serializer = ApplyPrepaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        prepayment_id = serializer.validated_data["prepayment_id"]
        invoice_id = serializer.validated_data["invoice_id"]
        amount = serializer.validated_data.get("amount")

        try:
            pre = Prepayment.objects.select_for_update().get(pk=prepayment_id, tenant=user)
        except Prepayment.DoesNotExist:
            return Response({"error": "Prepayment not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            invoice = Invoice.objects.get(pk=invoice_id)
        except Invoice.DoesNotExist:
            return Response({"error": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND)

        if amount is None:
            amount = min(pre.remaining, invoice.total_amount)

        with transaction.atomic():
            # Apply from prepayment
            actual = pre.apply(invoice, amount)
            if actual <= Decimal("0.00"):
                return Response({"error": "No remaining balance on prepayment."}, status=status.HTTP_400_BAD_REQUEST)

            # Create PaymentRecord for the applied amount
            payment = PaymentRecord.objects.create(
                invoice=invoice,
                tenant=user,
                amount=actual,
                method="wallet_auto",
                reference=pre.reference,
                status="success",
                confirmed_by=None,
                confirmed_at=now(),
            )
            # Evaluate invoice settlement
            payment.mark_invoice_paid_if_fully_settled()

        return Response({
            "message": "Applied successfully", 
            "applied_amount": str(actual), 
            "payment": PaymentRecordSerializer(payment).data,
            "remaining_balance": str(pre.remaining)
        }, status=status.HTTP_200_OK)

    # === PAYMENT ENDPOINTS ===
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

        with transaction.atomic():
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
            payment.mark_invoice_paid_if_fully_settled()

        return Response(PaymentRecordSerializer(payment).data, status=status.HTTP_201_CREATED)

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

    # === REPORTING ENDPOINTS ===
    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def statement(self, request):
        """
        Tenant-level statement of account with prepayment balance.
        """
        user = request.user
        tenant_id = request.query_params.get("tenant_id")
        role = getattr(user, "role", None)

        if tenant_id:
            if not (user.is_staff or user.is_superuser or role == "property_manager"):
                return Response({"error": "Not permitted to query other tenants."}, status=status.HTTP_403_FORBIDDEN)
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                target_tenant = User.objects.get(pk=tenant_id)
            except Exception:
                return Response({"error": "Tenant not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            target_tenant = user

        # Gather invoices for this tenant
        invoices = Invoice.objects.filter(tenant_apartment__tenant=target_tenant).order_by("-issued_at")
        prepayments = Prepayment.objects.filter(tenant=target_tenant, is_active=True)
        
        statement = []
        total_due = Decimal("0")
        total_paid = Decimal("0")
        total_outstanding = Decimal("0")

        for inv in invoices:
            paid_sum = PaymentRecord.objects.filter(invoice=inv, status="success").aggregate(
                total=Sum("amount")
            )["total"] or Decimal("0")
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

        # Calculate prepayment balance
        prepayment_balance = prepayments.aggregate(total=Sum("remaining"))["total"] or Decimal("0")

        return Response({
            "tenant": getattr(target_tenant, "id", None),
            "summary": {
                "total_due": str(total_due),
                "total_paid": str(total_paid),
                "total_outstanding": str(total_outstanding),
                "prepayment_balance": str(prepayment_balance)
            },
            "invoices": statement
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated, IsPropertyManager])
    def prepayment_list(self, request):
        """
        List prepayments for tenants managed by this property manager.
        """
        user = request.user
        prepayments = Prepayment.objects.filter(
            tenant__tenant_apartment__apartment__property__owner=user
        ).select_related("tenant").order_by("-created_at")
        
        serializer = PrepaymentSerializer(prepayments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
