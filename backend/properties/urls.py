# backend/properties/urls.py
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, ApartmentViewSet

router = DefaultRouter()
router.register(r"properties", PropertyViewSet, basename="property")
router.register(r"apartments", ApartmentViewSet, basename="apartment")

urlpatterns = router.urls
