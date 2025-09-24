from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.timezone import now
from .models import PaymentRecord
from .serializers import PaymentRecordSerializer, ConfirmManualPaymentSerializer
from bills.models import Invoice
from wallet.models import Wallet, WalletTransaction


class PaymentRecordViewSet(viewsets.ModelViewSet):
    queryset = PaymentRecord.objects.all()
    serializer_class = PaymentRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "tenant":
            return self.queryset.filter(invoice__tenant_apartment__tenant=user)
        elif user.role == "property_manager":
            return self.queryset.filter(invoice__tenant_apartment__property__manager=user)
        return PaymentRecord.objects.none()

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def confirm_manual_payment(self, request):
        """
        Property Manager confirms a cash or bank transfer payment.
        """
        serializer = ConfirmManualPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        invoice_id = serializer.validated_data["invoice_id"]
        amount = serializer.validated_data["amount"]
        method = serializer.validated_data["method"]
        reference = serializer.validated_data.get("reference", None)

        try:
            invoice = Invoice.objects.get(id=invoice_id)
        except Invoice.DoesNotExist:
            return Response({"error": "Invoice not found"}, status=status.HTTP_404_NOT_FOUND)

        if invoice.is_paid:
            return Response({"error": "Invoice already paid"}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.role != "property_manager":
            return Response({"error": "Only property managers can confirm manual payments"},
                            status=status.HTTP_403_FORBIDDEN)

        payment = PaymentRecord.objects.create(
            invoice=invoice,
            amount=amount,
            method=method,
            reference=reference,
            confirmed=True,
        )

        # Mark invoice as paid if fully covered
        if amount >= invoice.total_amount:
            invoice.is_paid = True
            invoice.save()

        return Response(PaymentRecordSerializer(payment).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def link_wallet_payment(self, request):
        """
        Link a WalletTransaction to a PaymentRecord for audit trail.
        """
        invoice_id = request.data.get("invoice_id")
        txn_id = request.data.get("txn_id")

        try:
            invoice = Invoice.objects.get(id=invoice_id)
        except Invoice.DoesNotExist:
            return Response({"error": "Invoice not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            wallet_txn = WalletTransaction.objects.get(id=txn_id, wallet__user=request.user)
        except WalletTransaction.DoesNotExist:
            return Response({"error": "Wallet transaction not found"}, status=status.HTTP_404_NOT_FOUND)

        payment = PaymentRecord.objects.create(
            invoice=invoice,
            amount=wallet_txn.amount,
            method="wallet_manual" if wallet_txn.txn_type == "debit" else "wallet_auto",
            reference=str(wallet_txn.id),
            confirmed=True,
        )

        if wallet_txn.amount >= invoice.total_amount:
            invoice.is_paid = True
            invoice.save()

        return Response(PaymentRecordSerializer(payment).data, status=status.HTTP_201_CREATED)
