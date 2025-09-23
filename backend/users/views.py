from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import status, viewsets, mixins
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import (
    RegisterSerializer,
    UserDetailSerializer,
    UserPublicSerializer,
    KYCSerializer,
    RoleUpdateSerializer,
)
from .permissions import IsOwnerOrAdmin

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    POST /api/users/register/  -> registers a new user
    Accepts optional KYC payload to create KYC record at signup.
    """
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)


class UserViewSet(viewsets.ModelViewSet):
    """
    /api/users/
    - list (admin only)
    - retrieve (owner or admin)
    - partial_update (owner or admin)
    - role assignment (admin only) -> custom action
    - kyc endpoints (nested)
    """
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserDetailSerializer
    permission_classes = (IsAuthenticated,)

    def get_permissions(self):
        # list only allowed to admin/staff (so admin can search users).
        if self.action in ["list"]:
            self.permission_classes = [IsAuthenticated, IsAdminUser]
        elif self.action in ["retrieve", "partial_update", "update"]:
            self.permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
        elif self.action in ["set_role", "kyc_list", "kyc_verify"]:
            self.permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == "list":
            return UserPublicSerializer
        return UserDetailSerializer

    @action(detail=True, methods=["post"], url_path="set-role", serializer_class=RoleUpdateSerializer)
    @transaction.atomic
    def set_role(self, request, pk=None):
        """
        Admin-only: change user's role.
        """
        user = self.get_object()
        serializer = RoleUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_role = serializer.validated_data["role"]
        user.role = new_role
        user.save(update_fields=["role"])
        return Response({"status": "ok", "role": user.role})

    @action(detail=True, methods=["get"], url_path="kyc", serializer_class=KYCSerializer)
    def kyc_detail(self, request, pk=None):
        user = self.get_object()
        if not hasattr(user, "kyc"):
            return Response({"detail": "No KYC record"}, status=status.HTTP_404_NOT_FOUND)
        serializer = KYCSerializer(user.kyc)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="kyc", serializer_class=KYCSerializer)
    def kyc_create(self, request, pk=None):
        """
        Allow user (owner) to create/update their KYC.
        Admins can use kyc_verify to mark verified.
        """
        user = self.get_object()
        # only owner or admin can create/update
        if not (request.user.is_staff or user.pk == request.user.pk):
            return Response(status=status.HTTP_403_FORBIDDEN)
        data = request.data.copy()
        data["user"] = user.pk
        # upsert pattern
        if hasattr(user, "kyc"):
            serializer = KYCSerializer(user.kyc, data=data, partial=True)
        else:
            serializer = KYCSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user)
        # update flag on user
        user.kyc_completed = getattr(user, "kyc", None) is not None and user.kyc.verified
        user.save(update_fields=["kyc_completed"])
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="kyc/verify")
    def kyc_verify(self, request, pk=None):
        """
        Admin-only: mark KYC verified or not.
        payload: {"verified": true}
        """
        user = self.get_object()
        if not hasattr(user, "kyc"):
            return Response({"detail": "No KYC record"}, status=status.HTTP_404_NOT_FOUND)
        verified = bool(request.data.get("verified", True))
        user.kyc.verified = verified
        user.kyc.save(update_fields=["verified"])
        user.kyc_completed = verified
        user.save(update_fields=["kyc_completed"])
        return Response({"status": "ok", "verified": verified})
