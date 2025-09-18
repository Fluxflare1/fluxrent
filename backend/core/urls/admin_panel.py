from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views.admin_panel import UserAdminViewSet, PlatformHealthViewSet
from core.views.admin_panel.dashboard import PlatformDashboardView

# Initialize the router and register all ViewSets
router = DefaultRouter()
router.register(r"admin/users", UserAdminViewSet, basename="admin-users")
router.register(r"admin/health", PlatformHealthViewSet, basename="admin-health")

# Combine the router's URLs with any additional paths
urlpatterns = [
    # Include all routes from the router
    path('', include(router.urls)),
    
    # Add your custom path for the dashboard view
    path("platform-admin/dashboard/", PlatformDashboardView.as_view(), name="platform-dashboard"),
]




