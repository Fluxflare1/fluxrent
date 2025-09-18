# backend/bills/views.py
from rest_framework import viewsets, permissions
from .models import Bill
from .serializers import BillSerializer

class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all().order_by("-issued_at")
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated]
