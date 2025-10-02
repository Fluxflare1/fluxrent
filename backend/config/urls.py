from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/owner/", include("owner.urls")),
    path("api/users/", include("users.urls")),
    path("api/properties", include("properties.urls")),
    path("api/tenants/", include("tenants.urls")),  # ✅ Tenants bonding system
    path("api/wallet/", include("wallet.urls")),  # ✅ Digital wallet
    path("api/bills/", include("bills.urls")),  # ✅ billing endpoints
    path("api/rents/", include("rents.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/finance/", include("finance.urls")),

    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/docs/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]





#
