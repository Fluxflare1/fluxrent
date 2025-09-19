# backend/bills/urls.py
from rest_framework import routers
from .views import BillTypeViewSet, BillViewSet, InvoiceViewSet, PaymentViewSet
from django.urls import path, include

router = routers.DefaultRouter()
router.register(r"types", BillTypeViewSet, basename="billtype")
router.register(r"bills", BillViewSet, basename="bill")
router.register(r"invoices", InvoiceViewSet, basename="invoice")
router.register(r"payments", PaymentViewSet, basename="payment")

urlpatterns = [
    path("", include(router.urls)),
]
