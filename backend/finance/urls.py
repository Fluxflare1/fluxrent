# backend/finance/urls.py
from rest_framework.routers import DefaultRouter
from .views import FeeConfigViewSet, TransactionAuditViewSet, DisputeViewSet

router = DefaultRouter()
router.register(r"fees", FeeConfigViewSet, basename="fee")
router.register(r"audits", TransactionAuditViewSet, basename="audit")
router.register(r"disputes", DisputeViewSet, basename="dispute")

urlpatterns = router.urls
