from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import SignupSerializer, UserSerializer, ApproveSerializer
from .models import User
from .services import assign_uid_to_user
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Custom token serializer to add role and uid to token response
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # custom claims
        token["role"] = user.role
        token["uid"] = user.uid
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["role"] = self.user.role
        data["uid"] = self.user.uid
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class SignupView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        email = data["email"].lower()
        if User.objects.filter(email=email).exists():
            return Response({"ok": False, "error": "Email already registered"}, status=400)
        # Create user; tenants get auto-approved
        role = data.get("role", "tenant")
        is_tenant = role == "tenant"
        user = User.objects.create_user(
            email=email,
            password=None,
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            phone=data.get("phone", ""),
            role=role,
            status="approved" if is_tenant else "pending",
            is_active=True
        )
        # assign UID for tenants immediately
        if is_tenant:
            assign_uid_to_user(user, entity_type="tenant")
        # In production: send email with instructions / OTP
        return Response({"ok": True, "data": UserSerializer(user).data}, status=201)

class ApproveUserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def post(self, request):
        # Only admin can approve — additional check below
        if request.user.role != "admin":
            return Response({"ok": False, "error": "Permission denied"}, status=403)
        serializer = ApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_id = serializer.validated_data["user_id"]
        approve = serializer.validated_data["approve"]
        role = serializer.validated_data.get("role")
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"ok": False, "error": "User not found"}, status=404)
        if approve:
            user.status = "approved"
            if role:
                user.role = role
            user.save()
            # assign uid for non-tenants now
            assign_uid_to_user(user, entity_type=user.role)
            # TODO: create DVA / send email via Celery
            return Response({"ok": True, "data": UserSerializer(user).data})
        else:
            user.status = "rejected"
            user.save()
            return Response({"ok": True, "data": UserSerializer(user).data})
