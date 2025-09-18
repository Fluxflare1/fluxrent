# backend/agreements/views.py
from rest_framework import viewsets, permissions
from .models import Agreement
from .serializers import AgreementSerializer

class AgreementViewSet(viewsets.ModelViewSet):
    queryset = Agreement.objects.all().order_by("-created_at")
    serializer_class = AgreementSerializer
    permission_classes = [permissions.IsAuthenticated]
