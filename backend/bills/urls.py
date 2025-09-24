from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet, BillItemViewSet, PaymentRecordViewSet

router = DefaultRouter()
router.register(r"invoices", InvoiceViewSet, basename="invoice")
router.register(r"items", BillItemViewSet, basename="billitem")
router.register(r"payments", PaymentRecordViewSet, basename="payment")

urlpatterns = router.urls

