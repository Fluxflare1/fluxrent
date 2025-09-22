from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from .admin import admin_site

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/properties/", include("properties.urls")),
    path("api/tenants/", include("tenants.urls")),
    path("api/bills/", include("bills.urls")),
    path("api/wallets/", include("wallets.urls")),
    path("api/payments/", include("payments.urls")),
]
