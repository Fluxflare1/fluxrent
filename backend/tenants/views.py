from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import TenantApartment, BondRequest, StatementOfStay
from .serializers import TenantApartmentSerializer, BondRequestSerializer, StatementOfStaySerializer
from .permissions import IsPropertyManagerOrSelf


class BondRequestViewSet(viewsets.ModelViewSet):
    """
    /api/tenants/bond-requests/
    Tenants can create bond requests (tenant-initiated).
    Property managers can list/approve/reject/force-create bonds.
    """
    queryset = BondRequest.objects.all().select_related("tenant", "apartment", "initiator", "processed_by")
    serializer_class = BondRequestSerializer
    permission_classes = [IsPropertyManagerOrSelf]

    def get_queryset(self):
        user = self.request.user
        # Tenants see their own requests; PMs see all (or filter by their properties in a future enhancement)
        if getattr(user, "is_staff", False) or getattr(user, "is_property_manager", False):
            return super().get_queryset()
        return self.queryset.filter(tenant=user)

    def perform_create(self, serializer):
        # Ensure the tenant is set to the requesting user (tenant-initiated flow).
        if serializer.validated_data.get("tenant") and serializer.validated_data["tenant"] != self.request.user:
            # only PMs should be able to create for others
            if not getattr(self.request.user, "is_staff", False):
                raise PermissionError("Not allowed to create bond requests for other tenants.")
        serializer.save(initiator=self.request.user)

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        req = self.get_object()
        # Only PM or apartment owner should approve — we use is_staff as PM for now
        if not getattr(request.user, "is_staff", False) and request.user != req.apartment.owner:
            return Response({"detail": "Not authorized to approve."}, status=status.HTTP_403_FORBIDDEN)
        with transaction.atomic():
            ta = req.approve(actor=request.user)
        serializer = TenantApartmentSerializer(ta, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        req = self.get_object()
        if not getattr(request.user, "is_staff", False) and request.user != req.apartment.owner:
            return Response({"detail": "Not authorized to reject."}, status=status.HTTP_403_FORBIDDEN)
        req.reject(actor=request.user)
        return Response({"detail": "Rejected"}, status=status.HTTP_200_OK)


class TenantApartmentViewSet(viewsets.ModelViewSet):
    """
    /api/tenants/tenant-apartments/
    - list: show bonds for request.user (or PM sees all)
    - retrieve: details
    - custom actions: terminate (PM or tenant can request terminate)
    """
    queryset = TenantApartment.objects.all().select_related("tenant", "apartment", "initiated_by")
    serializer_class = TenantApartmentSerializer
    permission_classes = [IsPropertyManagerOrSelf]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "is_staff", False) or getattr(user, "is_property_manager", False):
            return super().get_queryset()
        return self.queryset.filter(tenant=user)

    @action(detail=True, methods=["post"], url_path="terminate")
    def terminate(self, request, pk=None):
        bond = self.get_object()
        # Tenant can request termination of their own bond. PM can also terminate.
        if request.user != bond.tenant and not getattr(request.user, "is_staff", False):
            return Response({"detail": "Not authorized to terminate this bond."}, status=status.HTTP_403_FORBIDDEN)
        statement = bond.terminate(actor=request.user, notes=request.data.get("notes", ""))
        ser = None
        if statement:
            ser = StatementOfStaySerializer(statement, context={"request": request}).data
        return Response({"detail": "Terminated", "statement": ser}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request, pk=None):
        bond = self.get_object()
        if not getattr(request.user, "is_staff", False) and request.user != bond.apartment.owner:
            return Response({"detail": "Not authorized to activate."}, status=status.HTTP_403_FORBIDDEN)
        bond.activate(actor=request.user)
        return Response({"detail": "Activated"}, status=status.HTTP_200_OK)


class StatementOfStayViewSet(viewsets.ReadOnlyModelViewSet):
    """
    View-only for statements; tenants can view their own, PMs can view all for their properties.
    """
    queryset = StatementOfStay.objects.select_related("tenant_apartment__tenant", "tenant_apartment__apartment")
    serializer_class = StatementOfStaySerializer
    permission_classes = [IsPropertyManagerOrSelf]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "is_staff", False) or getattr(user, "is_property_manager", False):
            return super().get_queryset()
        # Tenant: show statements for tenant's bonds only
        return self.queryset.filter(tenant_apartment__tenant=user)
