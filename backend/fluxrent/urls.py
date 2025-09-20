# backend/fluxrent/urls.py
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/properties/", include("properties.urls")),
    path("api/tenants/", include("tenants.urls")),
    path("api/bills/", include("bills.urls")),
    path("api/wallets/", include("wallets.urls")),
    path("api/payments/", include("payments.urls")),

    # 👇 Redirect root to admin
    path("", RedirectView.as_view(url="/admin/", permanent=False)),
]
