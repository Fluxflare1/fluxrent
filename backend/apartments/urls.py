# backend/apartments/urls.py
from rest_framework.routers import DefaultRouter
from .views import ApartmentViewSet

router = DefaultRouter()
router.register(r"", ApartmentViewSet, basename="apartments")

urlpatterns = router.urls
