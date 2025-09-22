from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    # Keep /api/ or root mapping to core.urls
    path("", include("core.urls")),
    path("api/users/", include("users.urls")),
    path("api/properties/", include("properties.urls")),
    path("api/tenants/", include("tenants.urls")),
    path("api/bills/", include("bills.urls")),
    path("api/wallets/", include("wallets.urls")),
    path("api/payments/", include("payments.urls")),
    path("", include("django.contrib.auth.urls")),
]
