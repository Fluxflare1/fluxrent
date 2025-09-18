# backend/users/views.py
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, UserCreateSerializer
from core.permissions import IsAdminRole

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]

class MyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# Admin user management
class UserAdminViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
