# backend/core/urls.py
from django.urls import path, include
from django.contrib import admin
from rest_framework import routers

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),  # Phase 1: auth + users
]
