# backend/rents/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import TenancyViewSet, LateFeeRuleViewSet, RentInvoiceViewSet, RentPaymentViewSet
from .views_reports import CollectionSummaryView, LateFeePreviewApplyView

router = DefaultRouter()
router.register(r"tenancies", TenancyViewSet, basename="tenancy")
router.register(r"late-fee-rules", LateFeeRuleViewSet, basename="latefeerule")
router.register(r"invoices", RentInvoiceViewSet, basename="rentinvoice")
router.register(r"payments", RentPaymentViewSet, basename="rentpayment")

urlpatterns = [
    path("", include(router.urls)),
    path("reports/collection-summary/", CollectionSummaryView.as_view(), name="rents-collection-summary"),
    path("reports/late-fees/", LateFeePreviewApplyView.as_view(), name="rents-late-fee-preview-apply"),
]





