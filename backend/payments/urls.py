
# backend/payments/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import PaymentRecordViewSet
from . import reports
from .views.listings import (
    PropertyListingViewSet,
    ListingPhotoViewSet,
    InspectionBookingViewSet,
    SearchOptimizationViewSet,
)

router = DefaultRouter()
router.register(r"listings", PropertyListingViewSet, basename="listing")
router.register(r"photos", ListingPhotoViewSet, basename="listing-photo")
router.register(r"inspections", InspectionBookingViewSet, basename="inspection")
router.register(r"optimizations", SearchOptimizationViewSet, basename="optimization")
router.register(r"payments", PaymentRecordViewSet, basename="payment")

urlpatterns = [
    path("", include(router.urls)),
    path("reports/summary/", reports.SummaryReportView.as_view(), name="payments-reports-summary"),
    path("reports/method-breakdown/", reports.MethodBreakdownView.as_view(), name="payments-reports-method"),
    path("reports/portfolio/", reports.PortfolioOutstandingView.as_view(), name="payments-reports-portfolio"),
]

