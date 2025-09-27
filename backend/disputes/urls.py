# backend/disputes/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DisputeViewSet, disputes_sse

router = DefaultRouter()
router.register(r"disputes", DisputeViewSet, basename="dispute")

urlpatterns = [
    path("", include(router.urls)),
    path("sse/", disputes_sse, name="disputes-sse"),
]
