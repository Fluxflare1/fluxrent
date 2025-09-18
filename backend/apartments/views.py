# backend/apartments/views.py
from rest_framework import viewsets, permissions
from .models import Apartment
from .serializers import ApartmentSerializer

class ApartmentViewSet(viewsets.ModelViewSet):
    queryset = Apartment.objects.all().order_by("-created_at")
    serializer_class = ApartmentSerializer
    permission_classes = [permissions.IsAuthenticated]
