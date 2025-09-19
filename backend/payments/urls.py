from django.urls import path, include
from rest_framework.routers import DefaultRouter

# If you need payment API endpoints later, you can add them here
router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
]
