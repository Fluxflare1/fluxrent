# backend/properties/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsPropertyManagerOrReadOnly(BasePermission):
    """
    Allow safe methods to any authenticated user.
    Write/create/update/delete allowed only for:
      - super_admin
      - property_manager (as per SRS)
      - admin (if you have admin role names)
      - staff users (is_staff)
    Adjust ROLE_WHITELIST if your User.role uses different strings.
    """
    ROLE_WHITELIST = {"super_admin", "property_manager", "pm", "admin", "manager"}

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False

        # Safe methods allowed for authenticated users
        if request.method in SAFE_METHODS:
            return True

        # Allow staff
        if getattr(user, "is_staff", False):
            return True

        # Check role field on user model
        role = getattr(user, "role", None)
        if role and str(role).lower() in self.ROLE_WHITELIST:
            return True

        return False

    # ✅ OPTIONAL: Add object-level permission like the AI code
    def has_object_permission(self, request, view, obj):
        # Use the same logic as has_permission for object level
        return self.has_permission(request, view)
