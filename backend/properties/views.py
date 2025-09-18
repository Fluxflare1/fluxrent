# backend/properties/views.py
from rest_framework import viewsets, permissions
from .models import Property
from .serializers import PropertySerializer

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().order_by("-created_at")
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticated]
