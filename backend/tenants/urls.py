from rest_framework.routers import DefaultRouter
from .views import TenantBondViewSet, TenantApartmentViewSet, StatementOfStayViewSet

router = DefaultRouter()
router.register(r"bonds", TenantBondViewSet, basename="tenant-bond")
router.register(r"apartments", TenantApartmentViewSet, basename="tenant-apartment")
router.register(r"statements", StatementOfStayViewSet, basename="statement")

urlpatterns = router.urls
