# backend/properties/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, ApartmentViewSet

router = DefaultRouter()
router.register(r"properties", PropertyViewSet, basename="property")
router.register(r"apartments", ApartmentViewSet, basename="apartment")

urlpatterns = [
    path("", include(router.urls)),
]
