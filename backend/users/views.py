# backend/users/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string

from .models import User, KYC
from .serializers import UserSerializer, UserCreateSerializer, KYCSerializer, ChangePasswordSerializer

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class ObtainTokenPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims for frontend role-based routing
        token["role"] = user.role
        token["uid"] = user.uid
        token["kyc_completed"] = hasattr(user, 'kyc') and user.kyc.is_completed
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
        """GET /users/me/ - Current user profile for dashboard"""
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def set_password(self, request, pk=None):
        """POST /users/{id}/set_password/ - Change password"""
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

    @action(detail=True, methods=["get", "put", "patch"], permission_classes=[permissions.IsAuthenticated])
    def kyc(self, request, pk=None):
        """GET/PUT /users/{id}/kyc/ - Complete KYC form"""
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
            
            # If KYC is being marked as completed, generate wallet for user
            if ser.validated_data.get('is_completed') and not created:
                # TODO: Add wallet generation logic here
                pass
                
            return Response(ser.data)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def request_access(request):
    """
    POST /users/request-access/ - Request Access (Signup Step 1)
    Creates a pending user record and sends email with temporary credentials
    """
    data = request.data
    email = data.get("email")
    phone_number = data.get("phone_number")
    first_name = data.get("first_name")
    last_name = data.get("last_name")

    if not email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Check if user already exists
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "User with this email already exists. Please login or reset your password."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Generate temporary password
    temp_password = get_random_string(length=12)

    try:
        # Create user with temporary password
        user = User.objects.create(
            email=email,
            first_name=first_name or "",
            last_name=last_name or "",
            phone_number=phone_number or "",
            is_active=True,  # Active but needs KYC completion
        )
        user.set_password(temp_password)
        user.save()

        # Send welcome email with temporary credentials
        send_mail(
            subject="Welcome to FluxRent - Your Account Access",
            message=(
                f"Hello {first_name or 'there'},\n\n"
                f"Your FluxRent account has been successfully created!\n\n"
                f"Here are your temporary credentials:\n"
                f"Email: {email}\n"
                f"Temporary Password: {temp_password}\n\n"
                f"Please follow these steps to get started:\n"
                f"1. Login at: {getattr(settings, 'FRONTEND_URL', '')}/auth/login\n"
                f"2. Change your temporary password\n"
                f"3. Complete your KYC verification\n"
                f"4. Access your dashboard\n\n"
                f"For security reasons, please change your password after first login.\n\n"
                f"Welcome aboard!\n"
                f"The FluxRent Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response(
            {
                "detail": "Access requested successfully. Please check your email for temporary credentials and instructions.",
                "user_id": user.uid
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        # Log the error in production
        return Response(
            {"error": "Failed to create account. Please try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
