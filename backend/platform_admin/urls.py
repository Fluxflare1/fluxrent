from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RevenueTrendAPIView, UserGrowthAPIView, TopBoostedPropertiesAPIView,
    AuditLogViewSet, BroadcastTemplateViewSet, PlatformSettingViewSet
)

router = DefaultRouter()
router.register(r"audit-logs", AuditLogViewSet, basename="auditlog")
router.register(r"broadcast-templates", BroadcastTemplateViewSet, basename="broadcasttemplate")
router.register(r"platform-settings", PlatformSettingViewSet, basename="platformsetting")

urlpatterns = [
    path("stats/revenue/", RevenueTrendAPIView.as_view(), name="platform_admin_revenue"),
    path("stats/users/", UserGrowthAPIView.as_view(), name="platform_admin_user_growth"),
    path("stats/top-boosts/", TopBoostedPropertiesAPIView.as_view(), name="platform_admin_top_boosts"),
    path("", include(router.urls)),
]
