# backend/core/urls.py
from django.urls import path, include
from django.contrib import admin
from rest_framework import routers


urlpatterns = [
    path("admin/", admin.site.urls),

    # Existing apps
    path("api/users/", include("users.urls")),
    
    # New properties app routes
    path("api/properties/", include("properties.urls")),

    # other includes...
    path("api/tenants/", include("tenants.urls")),  # <--- ADD THIS
]
