# backend/rents/urls.py
from rest_framework.routers import DefaultRouter
from .views import TenancyViewSet, LateFeeRuleViewSet, RentInvoiceViewSet, RentPaymentViewSet

router = DefaultRouter()
router.register(r"tenancies", TenancyViewSet, basename="tenancy")
router.register(r"late-fee-rules", LateFeeRuleViewSet, basename="latefeerule")
router.register(r"invoices", RentInvoiceViewSet, basename="rentinvoice")
router.register(r"payments", RentPaymentViewSet, basename="rentpayment")

urlpatterns = router.urls
