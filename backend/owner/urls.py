# backend/owner/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DashboardViewSet, UserManagementViewSet, PropertyManagementViewSet, PlatformSettingViewSet

router = DefaultRouter()
router.register("dashboard", DashboardViewSet, basename="dashboard")
router.register("users", UserManagementViewSet, basename="users")
router.register("properties", PropertyManagementViewSet, basename="properties")
router.register("settings", PlatformSettingViewSet, basename="settings")

urlpatterns = [
    path("", include(router.urls)),
]
