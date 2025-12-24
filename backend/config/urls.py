backend/config/urls.py
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/platform-admin/", include("platform_admin.urls")),
    path("api/users/", include("users.urls")),
    path("api/properties/", include("properties.urls")),  # ✅ FIX 3: Added trailing slash
    path("api/tenants/", include("tenants.urls")),
    path("api/wallet/", include("wallet.urls")),
    path("api/bills/", include("bills.urls")),
    path("api/rents/", include("rents.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/finance/", include("finance.urls")),
    
    # ✅ FIX 4: Mount missing apps (only if they exist in the codebase)
    path("api/kyc/", include("kyc.urls")),
    path("api/disputes/", include("disputes.urls")),
    path("api/notifications/", include("notifications.urls")),

    # API documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/docs/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
