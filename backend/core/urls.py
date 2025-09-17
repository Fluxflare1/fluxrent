# backend/core/urls.py
from django.urls import path
from .views import RegisterView, LoginView, mock_api_views as mock

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    
    # Users
    path("api/users/", mock.users_list),
    path("api/users/<str:user_id>/", mock.user_by_id),
    path("api/users/by-email/", mock.user_by_email),
    path("api/users/upsert/", mock.upsert_user),
    path("api/auth/verify-password/", mock.verify_password),

    # Tenants
    path("api/tenants/", mock.tenants_list),

    # Bills
    path("api/bills/", mock.bills_list),
    path("api/bills/add/", mock.add_bill),

    # Agreements
    path("api/agreements/", mock.agreements_list),
    path("api/agreements/add/", mock.add_agreement),

    # Prepayments
    path("api/prepayments/", mock.prepayments_list),
    path("api/prepayments/add/", mock.add_prepayment),

    # Dashboard
    path("api/platform-admin/dashboard/", mock.dashboard_stats),
]
