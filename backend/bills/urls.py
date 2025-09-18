# backend/bills/urls.py
from rest_framework.routers import DefaultRouter
from .views import BillViewSet

router = DefaultRouter()
router.register(r"", BillViewSet, basename="bills")
urlpatterns = router.urls
