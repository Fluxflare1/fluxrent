# backend/tenants/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import TenantApartmentViewSet, BondRequestViewSet

router = DefaultRouter()
router.register(r"bonds", TenantApartmentViewSet, basename="tenant-bonds")
router.register(r"bond-requests", BondRequestViewSet, basename="bond-requests")

urlpatterns = [
    path("", include(router.urls)),
]
