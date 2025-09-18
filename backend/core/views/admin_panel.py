# backend/core/views/admin_panel.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

from core.permissions import IsAdminRole

User = get_user_model()

class UserAdminViewSet(viewsets.ModelViewSet):
    """
    Admin-only: Manage Users (CRUD, role assignment, activation).
    """
    queryset = User.objects.all()
    serializer_class = None  # Will use custom serializer below
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_serializer_class(self):
        from core.serializers.admin_panel import UserAdminSerializer
        return UserAdminSerializer

    @action(detail=True, methods=["post"])
    def set_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get("role")

        if role not in [r[0] for r in User.Role.choices]:
            return Response({"error": "Invalid role"}, status=400)

        user.role = role
        user.save()
        return Response({"status": "role updated", "user": user.email, "role": user.role})

    @action(detail=True, methods=["post"])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({"status": "active toggled", "user": user.email, "is_active": user.is_active})

    # ✅ ADDED FROM SECOND FILE: Simple stats endpoint
    @action(detail=False, methods=["get"])
    def stats(self, request):
        return Response({"total_users": User.objects.count()})


class PlatformHealthViewSet(viewsets.ViewSet):
    """
    Admin-only: Check platform health status.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def list(self, request):
        return Response({
            "status": "ok",
            "db": "connected",
            "users": User.objects.count(),
            "active_users": User.objects.filter(is_active=True).count(),
            "roles": {
                role[0]: User.objects.filter(role=role[0]).count()
                for role in User.Role.choices
            }
        })
