from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Allow access if request.user is the object owner (user.id == obj.id)
    or if user is staff/superuser.
    """

    def has_object_permission(self, request, view, obj):
        # obj is a User instance
        if request.user and request.user.is_authenticated:
            if request.user.is_staff or request.user.is_superuser:
                return True
            return obj.pk == request.user.pk
        return False


class IsPlatformOwner(permissions.BasePermission):
    """
    Only allow Platform Owners (role == OWNER) or superuser to perform sensitive actions.
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_superuser or getattr(user, "role", None) == UserRoleOwner()))
        

# helper to avoid import-cycle inside module-level
def UserRoleOwner():
    from django.contrib.auth import get_user_model
    User = get_user_model()
    return User.Role.OWNER
