# backend/core/permissions.py
from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    """
    Allow only users with role == 'super_admin' or 'admin'
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return getattr(user, "role", None) in ("super_admin", "admin")
