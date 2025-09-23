from rest_framework import viewsets, permissions
from .models import TenantBond, TenantApartment, StatementOfStay
from .serializers import TenantBondSerializer, TenantApartmentSerializer, StatementOfStaySerializer


class IsOwnerOrManager(permissions.BasePermission):
    """Tenant can view own bonds; Manager can approve/reject."""

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, TenantBond):
            return obj.tenant == request.user or obj.property_manager == request.user
        elif isinstance(obj, TenantApartment):
            return obj.tenant_bond.tenant == request.user or obj.tenant_bond.property_manager == request.user
        elif isinstance(obj, StatementOfStay):
            return (
                obj.tenant_apartment.tenant_bond.tenant == request.user
                or obj.tenant_apartment.tenant_bond.property_manager == request.user
            )
        return False


class TenantBondViewSet(viewsets.ModelViewSet):
    queryset = TenantBond.objects.all()
    serializer_class = TenantBondSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrManager]

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user)


class TenantApartmentViewSet(viewsets.ModelViewSet):
    queryset = TenantApartment.objects.all()
    serializer_class = TenantApartmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrManager]


class StatementOfStayViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StatementOfStay.objects.all()
    serializer_class = StatementOfStaySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrManager]
