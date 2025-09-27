# backend/finance/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils.timezone import now

from .models import FeeConfig, TransactionAudit, Dispute
from .serializers import FeeConfigSerializer, TransactionAuditSerializer, DisputeSerializer


class IsPlatformAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return getattr(request.user, "role", None) == "platform_owner" or request.user.is_staff


class FeeConfigViewSet(viewsets.ModelViewSet):
    queryset = FeeConfig.objects.all()
    serializer_class = FeeConfigSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]


class TransactionAuditViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Readonly endpoint for audits. Platform admin can view all; tenants can view audits related to their uid.
    """
    queryset = TransactionAudit.objects.all().order_by("-created_at")
    serializer_class = TransactionAuditSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "role", None) == "platform_owner" or user.is_staff:
            return self.queryset
        # tenant: filter by tenant_id (assumes user.uid present)
        return self.queryset.filter(tenant_id=getattr(user, "uid", None))


class DisputeViewSet(viewsets.ModelViewSet):
    queryset = Dispute.objects.all().select_related("transaction", "raised_by", "resolved_by")
    serializer_class = DisputeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "role", None) == "platform_owner" or user.is_staff:
            return self.queryset
        # users can only see disputes they raised
        return self.queryset.filter(raised_by=user)

    def perform_create(self, serializer):
        serializer.save(raised_by=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsPlatformAdmin])
    @transaction.atomic
    def resolve(self, request, pk=None):
        dispute = self.get_object()
        resolution = request.data.get("resolution")
        note = request.data.get("resolution_note", "")
        if resolution not in dict(Dispute._meta.get_field("resolution").choices).keys() and resolution not in ("refund", "no_action", "other"):
            return Response({"detail": "Invalid resolution"}, status=status.HTTP_400_BAD_REQUEST)

        dispute.resolution = resolution
        dispute.resolution_note = note
        dispute.status = "resolved"
        dispute.resolved_by = request.user
        dispute.updated_at = now()
        dispute.save(update_fields=["resolution", "resolution_note", "status", "resolved_by", "updated_at"])

        # Optional: if resolution == refund, create refund logic (out of scope for now) — admin triggers a refund via payments endpoints.
        return Response(DisputeSerializer(dispute).data, status=status.HTTP_200_OK)
