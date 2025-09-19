# backend/properties/views.py
from rest_framework import viewsets, permissions
from .models import Property
from apartments.models import Apartment
from .serializers import PropertySerializer, ApartmentSerializer
from .permissions import IsPropertyOwnerOrReadOnly


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().select_related("owner")
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated, IsPropertyManagerOrReadOnly]
    lookup_field = "uid"

    def perform_create(self, serializer):
        # If owner not supplied, use request.user as owner (if authenticated)
        owner = serializer.validated_data.get("owner") or self.request.user
        serializer.save(owner=owner)

class ApartmentViewSet(viewsets.ModelViewSet):
    queryset = Apartment.objects.all().select_related("property", "tenant")
    serializer_class = ApartmentSerializer
    permission_classes = [IsAuthenticated, IsPropertyManagerOrReadOnly]
    lookup_field = "uid"

    def perform_create(self, serializer):
        # default is_occupied based on tenant presence
        tenant = serializer.validated_data.get("tenant", None)
        is_occupied = bool(tenant)
        serializer.save(is_occupied=is_occupied)


