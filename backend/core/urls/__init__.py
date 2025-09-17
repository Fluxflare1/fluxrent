from django.urls import path, include

urlpatterns = [
    path("auth/", include("core.urls.auth")),        # Phase 1 Auth
    path("admin-panel/", include("core.urls.admin_panel")),  # Phase 2 Admin Panel
]
