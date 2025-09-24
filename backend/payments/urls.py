# backend/payments/urls.py
from rest_framework.routers import DefaultRouter
from .views import PaymentRecordViewSet

router = DefaultRouter()
router.register(r"payments", PaymentRecordViewSet, basename="payment")

urlpatterns = router.urls
