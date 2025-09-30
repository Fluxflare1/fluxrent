# backend/properties/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from properties.views.boosting import BoostPackageListView, CreateBoostPurchaseView, ConfirmExternalBoostView
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

    path("boost/packages/", BoostPackageListView.as_view(), name="boost-packages"),
    path("boost/purchase/", CreateBoostPurchaseView.as_view(), name="boost-purchase"),
    path("boost/confirm/", ConfirmExternalBoostView.as_view(), name="boost-confirm"),
]
