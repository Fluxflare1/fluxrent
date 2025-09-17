from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),   # Phase 1 Auth
    path("api/", include("core.urls")),         # Phase 2 Admin Panel + others
]
