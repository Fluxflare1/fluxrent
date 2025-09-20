from django.contrib import admin
from django.urls import path, include
from core.admin import custom_admin_site  # ⬅️ import our custom site

urlpatterns = [
    path("admin/", custom_admin_site.urls),  # ⬅️ use custom admin
    path("api/users/", include("users.urls")),
    path("api/properties/", include("properties.urls")),
    path("api/tenants/", include("tenants.urls")),
    path("api/bills/", include("bills.urls")),
    path("api/wallets/", include("wallets.urls")),
    path("api/payments/", include("payments.urls")),
]
