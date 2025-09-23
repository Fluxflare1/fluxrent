from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import User, KYC
from .serializers import UserSerializer, UserCreateSerializer, KYCSerializer, ChangePasswordSerializer

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class ObtainTokenPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token["role"] = user.role
        token["uid"] = user.uid
        return token


class ObtainTokenPairView(TokenObtainPairView):
    serializer_class = ObtainTokenPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        # Allow anyone to create (registration) but restrict list/retrieve to authenticated
        if self.action == "create":
            return [permissions.AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def set_password(self, request, pk=None):
        user = self.get_object()
        if request.user != user and not request.user.is_superuser:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        if not user.check_password(serializer.validated_data["old_password"]) and not request.user.is_superuser:
            return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Password updated."})

    @action(detail=True, methods=["get", "put"], permission_classes=[permissions.IsAuthenticated])
    def kyc(self, request, pk=None):
        user = self.get_object()
        # Only self or platform owner can view/edit KYC
        if request.user != user and not request.user.is_superuser:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        if request.method == "GET":
            if hasattr(user, "kyc"):
                ser = KYCSerializer(user.kyc)
                return Response(ser.data)
            return Response({}, status=status.HTTP_200_OK)
        else:
            data = request.data
            obj, created = KYC.objects.get_or_create(user=user)
            ser = KYCSerializer(obj, data=data, partial=True)
            ser.is_valid(raise_exception=True)
            ser.save()
            return Response(ser.data)
