from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet, BillItemViewSet, PaymentRecordViewSet

router = DefaultRouter()
router.register(r"invoices", InvoiceViewSet, basename="invoice")
router.register(r"payments", PaymentRecordViewSet, basename="payment")
router.register(r"items", BillItemViewSet, basename="billitem")

urlpatterns = [
    path("", include(router.urls)),
]



