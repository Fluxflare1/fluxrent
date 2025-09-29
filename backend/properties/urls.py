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

# Property Listing & Search System
router.register(r"listings", PropertyListingViewSet, basename="listing")
router.register(r"units", ApartmentUnitViewSet, basename="unit")
router.register(r"media", PropertyMediaViewSet, basename="media")
router.register(r"inspections", InspectionBookingViewSet, basename="inspection")
router.register(r"message-threads", MessageThreadViewSet, basename="message-thread")
router.register(r"messages", MessageViewSet, basename="message")

urlpatterns = router.urls + [
    # Reporting
    path("reports/engagement/", engagement_report, name="engagement-report"),
]
