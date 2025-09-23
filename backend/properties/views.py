from rest_framework import viewsets, permissions
from .models import Property, Apartment
from .serializers import PropertySerializer, ApartmentSerializer


class IsPropertyManagerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Only property manager can edit their own property/apartment
        return obj.manager == request.user or getattr(obj, "property", None) and obj.property.manager == request.user


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsPropertyManagerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(manager=self.request.user)


class ApartmentViewSet(viewsets.ModelViewSet):
    queryset = Apartment.objects.all()
    serializer_class = ApartmentSerializer
    permission_classes = [IsPropertyManagerOrReadOnly]
