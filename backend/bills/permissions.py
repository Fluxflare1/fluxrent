# backend/bills/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.conf import settings

class IsAdminOrReadOnly(BasePermission):
    """
    Allow full access to staff/superusers; read-only for others.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and (request.user.is_staff or request.user.is_superuser)


class IsInvoiceRelatedParty(BasePermission):
    """
    Allow access to invoice if the user is:
    - staff/superuser OR
    - tenant on the TenantApartment bond associated with the invoice OR
    - property owner (owner of property for the apartment)
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff or user.is_superuser:
            return True
        try:
            tenant = getattr(obj, "tenant_apartment", None) and getattr(obj.tenant_apartment, "tenant", None)
            if tenant and tenant == user:
                return True
        except Exception:
            pass
        # property owner
        try:
            ap = getattr(obj, "tenant_apartment", None) and getattr(obj.tenant_apartment, "apartment", None)
            if ap and getattr(ap, "property", None) and getattr(ap.property, "owner", None) == user:
                return True
        except Exception:
            pass
        return False
