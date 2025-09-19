# backend/bills/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import BillType, Bill, Invoice, InvoiceLine, Payment
from .serializers import (
    BillTypeSerializer,
    BillSerializer,
    InvoiceSerializer,
    InvoiceLineSerializer,
    PaymentSerializer,
)
from .permissions import IsAdminOrReadOnly, IsInvoiceRelatedParty

class BillTypeViewSet(viewsets.ModelViewSet):
    queryset = BillType.objects.all()
    serializer_class = BillTypeSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]


class BillViewSet(viewsets.ModelViewSet):
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
    queryset = Invoice.objects.select_related("tenant_apartment").prefetch_related("lines", "payments").all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    # object-level permission used for retrieve/update
    def get_permissions(self):
        if self.action in ("retrieve", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsInvoiceRelatedParty()]
        if self.action in ("issue", "mark_paid"):
            return [IsAuthenticated(), IsAdminOrReadOnly()]
        return [IsAuthenticated()]

    @action(detail=True, methods=["post"])
    def issue(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status != Invoice.STATUS_DRAFT:
            return Response({"detail": "Invoice already issued or not in draft"}, status=status.HTTP_400_BAD_REQUEST)
        invoice.status = Invoice.STATUS_ISSUED
        if not invoice.issue_date:
            invoice.issue_date = timezone.now().date()
        invoice.save(update_fields=["status", "issue_date"])
        return Response({"status": "issued", "invoice_no": invoice.invoice_no})

    @action(detail=True, methods=["post"])
    def mark_paid(self, request, pk=None):
        invoice = self.get_object()
        # create a payment record (admin confirms)
        ref = request.data.get("payment_ref") or f"manual-{timezone.now().timestamp()}"
        amount = request.data.get("amount") or invoice.total_amount
        payment = Payment.objects.create(invoice=invoice, payment_ref=ref, amount=amount, method=request.data.get("method", "bank"), status=Payment.STATUS_CONFIRMED, paid_at=timezone.now())
        invoice.recalc_totals()
        return Response({"status": "marked_paid", "payment_id": payment.id})


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related("invoice").all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        # Anyone authenticated can create a payment (to record), but only staff can set confirmed statuses
        if self.action in ("create",):
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrReadOnly()]

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        payment = self.get_object()
        if payment.status == Payment.STATUS_CONFIRMED:
            return Response({"detail": "already confirmed"}, status=status.HTTP_400_BAD_REQUEST)
        payment.confirm()
        return Response({"status": "confirmed", "payment_ref": payment.payment_ref})
