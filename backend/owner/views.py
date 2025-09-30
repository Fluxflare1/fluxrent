# backend/owner/views.py
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Count
from users.models import User
from properties.models import Property
from wallets.models import Transaction
from .models import PlatformSetting, AdminActionLog
from .serializers import (
    UserSerializer, PropertySerializer, TransactionSerializer, PlatformSettingSerializer
)

class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "owner"

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsOwner]

    @action(detail=False, methods=["get"])
    def summary(self, request):
        users_count = User.objects.count()
        properties_count = Property.objects.count()
        revenue = Transaction.objects.filter(status="success").aggregate(total=Sum("amount"))["total"] or 0
        return Response({
            "users": users_count,
            "properties": properties_count,
            "revenue": revenue
        })

    @action(detail=False, methods=["get"])
    def revenue_breakdown(self, request):
        qs = Transaction.objects.filter(status="success").values("type").annotate(total=Sum("amount"))
        return Response(list(qs))

class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsOwner]

    @action(detail=True, methods=["post"])
    def suspend(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({"status": "suspended"})

    @action(detail=True, methods=["post"])
    def verify_kyc(self, request, pk=None):
        user = self.get_object()
        user.kyc_verified = True
        user.save()
        return Response({"status": "kyc_verified"})

class PropertyManagementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Property.objects.all().order_by("-boost_until")
    serializer_class = PropertySerializer
    permission_classes = [IsOwner]

class PlatformSettingViewSet(viewsets.ModelViewSet):
    queryset = PlatformSetting.objects.all()
    serializer_class = PlatformSettingSerializer
    permission_classes = [IsOwner]
