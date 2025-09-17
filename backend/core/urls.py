# backend/core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, mock_api_views as mock
from .views import mock_viewsets as v

# Import the specific ViewSets for clarity and maintainability
from core.viewsets.property import PropertyViewSet
from core.viewsets.apartment import ApartmentViewSet
from core.viewsets.utility import UtilityViewSet
from core.viewsets.template import TemplateViewSet
from core.viewsets.notification import NotificationViewSet

# Initialize router
router = DefaultRouter()

# Register ViewSets with router
router.register(r"users", v.UserViewSet, basename="users")
router.register(r"tenants", v.TenantViewSet, basename="tenants")
router.register(r"bills", v.BillViewSet, basename="bills")
router.register(r"agreements", v.AgreementViewSet, basename="agreements")
router.register(r"prepayments", v.PrepaymentViewSet, basename="prepayments")
router.register(r"platform-admin/dashboard", v.DashboardViewSet, basename="dashboard")

# Register the explicitly imported ViewSets
router.register(r"properties", PropertyViewSet, basename="properties")
router.register(r"apartments", ApartmentViewSet, basename="apartments")
router.register(r"utilities", UtilityViewSet, basename="utilities")
router.register(r"templates", TemplateViewSet, basename="templates")
router.register(r"notifications", NotificationViewSet, basename="notifications")

# Combine router URLs with custom paths in a single urlpatterns list
urlpatterns = [
    # Authentication
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    
    # Mock API endpoints (consider migrating these to ViewSets)
    path("api/users/", mock.users_list),
    path("api/users/<str:user_id>/", mock.user_by_id),
    path("api/users/by-email/", mock.user_by_email),
    path("api/users/upsert/", mock.upsert_user),
    path("api/auth/verify-password/", mock.verify_password),
    path("api/tenants/", mock.tenants_list),
    path("api/bills/", mock.bills_list),
    path("api/bills/add/", mock.add_bill),
    path("api/agreements/", mock.agreements_list),
    path("api/agreements/add/", mock.add_agreement),
    path("api/prepayments/", mock.prepayments_list),
    path("api/prepayments/add/", mock.add_prepayment),
    path("api/platform-admin/dashboard/", mock.dashboard_stats),

    # Include all router-generated URLs
    path("api/", include(router.urls)),
]
