# backend/templates_app/views.py
from rest_framework import viewsets, permissions
from .models import Template
from .serializers import TemplateSerializer

class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all().order_by("-created_at")
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
