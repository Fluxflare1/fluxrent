# backend/users/views.py
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model

from .serializers import UserSerializer, UserCreateSerializer, UserAdminSerializer
from .permissions import IsSuperAdmin, IsAdminOrManager

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """
    /api/users/  (list, retrieve, update, destroy)
    - Anyone can create (register)
    - Authenticated users can retrieve/update themselves
    - Admins can manage all users
    """
    queryset = User.objects.all().order_by("-id")

    def get_serializer_class(self):
        if self.action in ("create",):
            return UserCreateSerializer
        # admin endpoints
        if self.request.user.is_authenticated and self.request.user.role == "super_admin":
            return UserAdminSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ("create",):
            return [AllowAny()]
        if self.action in ("list", "destroy", "partial_update", "update"):
            # only super admins can list or delete
            return [IsAuthenticated(), IsSuperAdmin()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsSuperAdmin])
    def set_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get("role")
        if role not in [choice[0] for choice in User.role.field.choices]:
            return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)
        user.role = role
        user.save()
        return Response({"status": "role-updated", "role": user.role})
