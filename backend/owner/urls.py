# backend/owner/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DashboardViewSet, 
    UserManagementViewSet, 
    PropertyManagementViewSet, 
    PlatformSettingViewSet, 
    NotificationBroadcastViewSet, 
    RevenueStatsView, 
    UserGrowthView, 
    TopBoostsView
)

router = DefaultRouter()
router.register("dashboard", DashboardViewSet, basename="owner-dashboard")
router.register("users", UserManagementViewSet, basename="owner-users")
router.register("properties", PropertyManagementViewSet, basename="owner-properties")
router.register("settings", PlatformSettingViewSet, basename="owner-settings")
router.register("notifications", NotificationBroadcastViewSet, basename="owner-notifications")

urlpatterns = [
    path("", include(router.urls)),
    path("stats/revenue/", RevenueStatsView.as_view(), name="owner-stats-revenue"),
    path("stats/users/", UserGrowthView.as_view(), name="owner-stats-users"),
    path("stats/top-boosts/", TopBoostsView.as_view(), name="owner-stats-top-boosts"),
]
