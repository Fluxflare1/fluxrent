from django.urls import path
from .views import RegisterView, LoginView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
]




from django.urls import path, include

urlpatterns = [
    path("auth/", include("core.urls.auth")),   # Phase 1 Auth
    path("", include("core.urls.admin_panel")), # Phase 2 Admin Panel
]
