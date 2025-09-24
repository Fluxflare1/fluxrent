from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentRecordViewSet

router = DefaultRouter()
router.register(r"records", PaymentRecordViewSet, basename="payment-record")

urlpatterns = [
    path("", include(router.urls)),
]
