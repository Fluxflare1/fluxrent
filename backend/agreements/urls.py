# backend/agreements/urls.py
from rest_framework.routers import DefaultRouter
from .views import AgreementViewSet

router = DefaultRouter()
router.register(r"", AgreementViewSet, basename="agreements")
urlpatterns = router.urls
