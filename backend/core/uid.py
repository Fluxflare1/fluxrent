# backend/core/urls.py
from django.urls import path, include
from django.contrib import admin


urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth & user management
    path("api/", include("users.urls")),

    # App endpoints (DRF routers defined inside each app)
    path("api/properties/", include("properties.urls")),
    path("api/apartments/", include("apartments.urls")),
    path("api/bills/", include("bills.urls")),
    path("api/agreements/", include("agreements.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/templates/", include("templates_app.urls")),
]



