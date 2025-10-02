from rest_framework.permissions import BasePermission

class IsPlatformAdmin(BasePermission):
    """
    Allow access only to staff or superusers.
    Use this for all platform admin views.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Staff or superuser allowed
        return user.is_staff or user.is_superuser
