
code 1 (existing Code)
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, ApartmentViewSet
from .views.listings import (
    PropertyListingViewSet,
    ListingPhotoViewSet,
    InspectionBookingViewSet,
    SearchOptimizationViewSet,
)
from django.urls import path
from .views.reports import EngagementReportView

router = DefaultRouter()
router.register(r"properties", PropertyViewSet, basename="property")
router.register(r"apartments", ApartmentViewSet, basename="apartment")
router.register(r"listings", PropertyListingViewSet, basename="listing")
router.register(r"photos", ListingPhotoViewSet, basename="listing-photo")
router.register(r"inspections", InspectionBookingViewSet, basename="inspection")
router.register(r"optimizations", SearchOptimizationViewSet, basename="optimization")


urlpatterns = router.urls + [
    path("reports/engagement/", EngagementReportView.as_view(), name="engagement-report"),
]




# backend/properties/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    PropertyListingViewSet,
    ApartmentUnitViewSet,
    PropertyMediaViewSet,
    InspectionBookingViewSet,
    MessageThreadViewSet,
    MessageViewSet,
    engagement_report,
)

router = DefaultRouter()

# Primary API endpoints
router.register(r"listings", PropertyListingViewSet, basename="listing")
router.register(r"units", ApartmentUnitViewSet, basename="unit")
router.register(r"media", PropertyMediaViewSet, basename="media")
router.register(r"inspections", InspectionBookingViewSet, basename="inspection")
router.register(r"message-threads", MessageThreadViewSet, basename="message-thread")
router.register(r"messages", MessageViewSet, basename="message")

urlpatterns = router.urls + [
    # Reporting endpoint
    path("reports/engagement/", engagement_report, name="engagement-report"),
]
