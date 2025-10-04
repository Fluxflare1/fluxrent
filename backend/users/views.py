
code 1 (existing code)

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





code 2 (new code) the ai that generated it said i should extend views.py with it so what do we do

from rest_framework.decorators import api_view
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string

@api_view(["post"])
def request_access(request):
    """
    Request Access (Signup Step 1).
    Creates a pending user record and sends email verification.
    """
    data = request.data
    email = data.get("email")
    phone = data.get("phone_number")
    first_name = data.get("first_name")
    last_name = data.get("last_name")

    if not email:
        return Response({"error": "Email is required"}, status=400)

    # temporary password (force reset on login)
    temp_password = get_random_string(length=10)

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "first_name": first_name,
            "last_name": last_name,
            "phone_number": phone,
            "is_active": True,  # active but no KYC yet
        },
    )

    if created:
        user.set_password(temp_password)
        user.save()

        send_mail(
            "Welcome to FluxRent",
            f"Hello {first_name},\n\nYour account has been created.\nUse this link to set your password and complete KYC.\n\nUsername: {email}\nTemp Password: {temp_password}",
            settings.DEFAULT_FROM_EMAIL,
            [email],
        )

    return Response({"detail": "Access requested. Please check your email."})
