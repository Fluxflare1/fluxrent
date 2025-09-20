# backend/tenants/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import TenantApartmentViewSet, BondRequestViewSet

router = DefaultRouter()
router.register(r'tenant-apartments', TenantApartmentViewSet)
router.register(r'bond-requests', BondRequestViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
