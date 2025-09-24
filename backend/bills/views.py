from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Invoice, BillItem, PaymentRecord
from .serializers import InvoiceSerializer, BillItemSerializer, PaymentRecordSerializer
from wallet.models import Wallet, WalletTransaction

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "tenant":
            return self.queryset.filter(tenant_apartment__tenant=user)
        elif user.role == "property_manager":
            return self.queryset.filter(tenant_apartment__property__manager=user)
        return Invoice.objects.none()

class BillItemViewSet(viewsets.ModelViewSet):
    queryset = BillItem.objects.all()
    serializer_class = BillItemSerializer
    permission_classes = [permissions.IsAuthenticated]

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

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def pay_with_wallet(self, request, pk=None):
        """
        Tenant triggers manual wallet payment.
        """
        user = request.user
        invoice = self.get_object()

        if invoice.is_paid:
            return Response({"error": "Invoice already paid"}, status=status.HTTP_400_BAD_REQUEST)

        # FIXED: Simple wallet lookup without wallet_type
        wallet = Wallet.objects.filter(user=user).first()
        if not wallet:
            return Response({"error": "No wallet found for this user"}, status=status.HTTP_400_BAD_REQUEST)

        if wallet.balance < invoice.total_amount:
            return Response({"error": "Insufficient wallet balance"}, status=status.HTTP_400_BAD_REQUEST)

        # Deduct from wallet
        wallet.balance -= invoice.total_amount
        wallet.save()

        WalletTransaction.objects.create(
            wallet=wallet,
            txn_type="debit",
            amount=invoice.total_amount,
            description=f"Manual wallet payment for Invoice {invoice.uid}",
            status="success",
        )

        # Create PaymentRecord
        payment = PaymentRecord.objects.create(
            invoice=invoice,
            amount_paid=invoice.total_amount,
            method="wallet_manual",
        )
        invoice.is_paid = True
        invoice.save()

        return Response(PaymentRecordSerializer(payment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def confirm_cash(self, request, pk=None):
        """
        Property Manager confirms cash payment.
        """
        user = request.user
        invoice = self.get_object()

        if user.role != "property_manager":
            return Response({"error": "Only property managers can confirm cash payments"},
                            status=status.HTTP_403_FORBIDDEN)

        if invoice.is_paid:
            return Response({"error": "Invoice already paid"}, status=status.HTTP_400_BAD_REQUEST)

        payment = PaymentRecord.objects.create(
            invoice=invoice,
            amount_paid=invoice.total_amount,
            method="cash",
        )
        invoice.is_paid = True
        invoice.save()

        return Response(PaymentRecordSerializer(payment).data, status=status.HTTP_201_CREATED)
