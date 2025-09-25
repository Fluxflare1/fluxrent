from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, ApartmentViewSet
from .views.listings import (
    PropertyListingViewSet,
    ListingPhotoViewSet,
    InspectionBookingViewSet,
    SearchOptimizationViewSet,
)

router = DefaultRouter()
router.register(r"properties", PropertyViewSet, basename="property")
router.register(r"apartments", ApartmentViewSet, basename="apartment")
router.register(r"listings", PropertyListingViewSet, basename="listing")
router.register(r"photos", ListingPhotoViewSet, basename="listing-photo")
router.register(r"inspections", InspectionBookingViewSet, basename="inspection")
router.register(r"optimizations", SearchOptimizationViewSet, basename="optimization")

urlpatterns = router.urls
