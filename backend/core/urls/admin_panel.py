from rest_framework.routers import DefaultRouter
from core.views.admin_panel import UserAdminViewSet, PlatformHealthViewSet

router = DefaultRouter()
router.register(r"admin/users", UserAdminViewSet, basename="admin-users")
router.register(r"admin/health", PlatformHealthViewSet, basename="admin-health")

urlpatterns = router.urls
