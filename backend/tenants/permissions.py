from rest_framework import permissions


class IsPropertyManagerOrSelf(permissions.BasePermission):
    """
    Allow safe methods to anyone authenticated.
    For modifying/approving operations:
    - Property Managers (we assume is_staff or a role flag) can act on bond requests for apartments they manage.
    - The tenant (self) can create a bond request for themselves or cancel their own request.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def _is_pm(self, user):
        # Adjust this if your User model uses roles (e.g., user.role == 'pm')
        return getattr(user, "is_staff", False) or getattr(user, "is_property_manager", False)

    def has_object_permission(self, request, view, obj):
        # If object is BondRequest: allow tenant to view/modify their own request
        if hasattr(obj, "tenant"):
            if request.user == obj.tenant:
                return True
        # If Property Manager
        if self._is_pm(request.user):
            return True
        return False
