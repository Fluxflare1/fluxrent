from rest_framework import routers
from django.urls import path, include

from .views import BondRequestViewSet, TenantApartmentViewSet, StatementOfStayViewSet

router = routers.DefaultRouter()
router.register(r"bond-requests", BondRequestViewSet, basename="bondrequest")
router.register(r"tenant-apartments", TenantApartmentViewSet, basename="tenantapartment")
router.register(r"statements", StatementOfStayViewSet, basename="statement")

urlpatterns = [
    path("", include(router.urls)),
]
