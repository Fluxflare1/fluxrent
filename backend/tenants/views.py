# backend/tenants/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404

from .models import TenantApartment, BondRequest
from .serializers import TenantApartmentSerializer, BondRequestCreateSerializer, BondRequestSerializer
from .permissions import IsPropertyManager
from apartments.models import Apartment  # import directly; ensure app exists
from .models import TenantApartment, BondRequest

class TenantApartmentViewSet(viewsets.ModelViewSet):
    """
    Manage TenantApartment records. Only authorized actors (admins/PMs or participating tenant) can operate.
    """
    queryset = TenantApartment.objects.all()
    serializer_class = TenantApartmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admins / staff see all; normal users see only their bonds
        if user.is_superuser or getattr(user, "is_staff", False):
            return TenantApartment.objects.all()
        return TenantApartment.objects.filter(tenant=user)

    def perform_create(self, serializer):
        # Creating a bond programmatically: mark as active and set activated_at
        serializer.save(activated_at=timezone.now(), bond_status=TenantApartment.BondStatus.ACTIVE)

    @action(detail=False, methods=["get"], url_path="my-apartments")
    def my_apartments(self, request):
        user = request.user
        bonds = TenantApartment.objects.filter(tenant=user, bond_status=TenantApartment.BondStatus.ACTIVE).select_related("apartment")
        serializer = self.get_serializer(bonds, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsPropertyManager])
    def terminate(self, request, pk=None):
        bond = self.get_object()
        if bond.bond_status == TenantApartment.BondStatus.TERMINATED:
            return Response({"detail": "Already terminated."}, status=status.HTTP_400_BAD_REQUEST)
        bond.bond_status = TenantApartment.BondStatus.TERMINATED
        bond.terminated_at = timezone.now()
        bond.save()
        return Response(self.get_serializer(bond).data)

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def request_unbond(self, request):
        """
        Tenant requests to unbond — this creates a BondRequest with initiator set to tenant and 'unbond' in message.
        PM will process (approve => sets TenantApartment.terminated_at and bond_status=terminated).
        """
        tenant = request.user
        apartment_id = request.data.get("apartment_id")
        apartment = get_object_or_404(Apartment, pk=apartment_id)
        # Ensure bond exists
        try:
            bond = TenantApartment.objects.get(tenant=tenant, apartment=apartment, bond_status=TenantApartment.BondStatus.ACTIVE)
        except TenantApartment.DoesNotExist:
            return Response({"detail": "Active bond not found"}, status=status.HTTP_400_BAD_REQUEST)

        # Create a BondRequest for unbonding
        br = BondRequest.objects.create(
            tenant=tenant,
            apartment=apartment,
            initiator=tenant,
            message=request.data.get("message", "Tenant requested unbond/unlink."),
            status=BondRequest.RequestStatus.PENDING
        )
        return Response(BondRequestSerializer(br).data, status=status.HTTP_201_CREATED)


class BondRequestViewSet(viewsets.ModelViewSet):
    """
    Create/list bond requests. Approve/reject via actions.
    """
    queryset = BondRequest.objects.all().select_related("tenant", "apartment", "initiator", "processed_by")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ("create",):
            return BondRequestCreateSerializer
        return BondRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or getattr(user, "is_staff", False):
            return self.queryset
        # Tenants see their own requests; PMs see requests for apartments they own/manage
        qs = BondRequest.objects.filter(tenant=user)
        # include PM view: if user is PM, show requests for apartments the PM owns
        if getattr(user, "role", "").lower() in ("pm", "property_manager", "manager", "property-manager") or user.is_staff:
            qs = BondRequest.objects.filter(apartment__property__owner=user) | qs
        return qs.distinct()

    def perform_create(self, serializer):
        # Tenant or PM initiates request
        initiator = self.request.user
        serializer.save(initiator=initiator)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsPropertyManager])
    def approve(self, request, pk=None):
        req = self.get_object()
        if req.status != BondRequest.RequestStatus.PENDING:
            return Response({"detail": "Already processed."}, status=status.HTTP_400_BAD_REQUEST)
        # create or activate TenantApartment
        try:
            with transaction.atomic():
                bond, created = TenantApartment.objects.get_or_create(
                    tenant=req.tenant,
                    apartment=req.apartment,
                    defaults={
                        "initiated_by": req.initiator,
                        "bond_status": TenantApartment.BondStatus.ACTIVE,
                        "activated_at": timezone.now(),
                    },
                )
                if not created:
                    bond.bond_status = TenantApartment.BondStatus.ACTIVE
                    bond.activated_at = timezone.now()
                    bond.save()
                req.status = BondRequest.RequestStatus.APPROVED
                req.processed_at = timezone.now()
                req.processed_by = request.user
                req.save()
        except IntegrityError:
            return Response({"detail": "Failed to create/activate bond"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"detail": "Approved", "bond_id": bond.id})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsPropertyManager])
    def reject(self, request, pk=None):
        req = self.get_object()
        if req.status != BondRequest.RequestStatus.PENDING:
            return Response({"detail": "Already processed"}, status=status.HTTP_400_BAD_REQUEST)
        req.status = BondRequest.RequestStatus.REJECTED
        req.processed_at = timezone.now()
        req.processed_by = request.user
        req.save()
        return Response({"detail": "Rejected"})
