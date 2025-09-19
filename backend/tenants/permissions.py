# backend/tenants/permissions.py
from rest_framework.permissions import BasePermission

class IsPropertyManager(BasePermission):
    """
    Accepts if the user appears to have a property manager role or is staff/superuser.
    Adjust according to your User.role choices; default checks for 'pm' or 'manager'.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser or getattr(user, "is_staff", False):
            return True
        role = getattr(user, "role", None)
        if not role:
            return False
        return role.lower() in ("pm", "property_manager", "manager", "property-manager")
