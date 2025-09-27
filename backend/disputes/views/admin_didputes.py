from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
import csv, io
import pandas as pd

from .models import Dispute, DisputeAuditTrail
from .serializers import DisputeSerializer, DisputeAuditSerializer

class AdminDisputeViewSet(viewsets.ModelViewSet):
    queryset = Dispute.objects.all().order_by('-created_at')
    serializer_class = DisputeSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        # Filters
        status_filter = self.request.query_params.get('status')
        user_filter = self.request.query_params.get('user')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        search = self.request.query_params.get('search')

        if status_filter:
            qs = qs.filter(status=status_filter)
        if user_filter:
            qs = qs.filter(user_id=user_filter)
        if start_date and end_date:
            qs = qs.filter(created_at__range=[start_date, end_date])
        if search:
            qs = qs.filter(
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search) |
                Q(transaction__reference__icontains=search)
            )

        return qs

    @action(detail=True, methods=['get'])
    def audit_trail(self, request, pk=None):
        dispute = self.get_object()
        audits = DisputeAuditTrail.objects.filter(dispute=dispute).order_by('-timestamp')
        serializer = DisputeAuditSerializer(audits, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_resolve(self, request):
        ids = request.data.get("ids", [])
        disputes = Dispute.objects.filter(id__in=ids, status="OPEN")
        disputes.update(status="RESOLVED", resolved_at=timezone.now())
        return Response({"resolved_count": disputes.count()}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        qs = self.get_queryset()
        serializer = DisputeSerializer(qs, many=True)

        response = Response(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="disputes.csv"'
        writer = csv.writer(io.StringIO())
        writer.writerow(["ID", "User", "Transaction", "Status", "Created At"])
        for item in serializer.data:
            writer.writerow([item["id"], item["user"], item["transaction"], item["status"], item["created_at"]])
        return response

    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        qs = self.get_queryset().values("id", "user__username", "transaction__reference", "status", "created_at")
        df = pd.DataFrame(list(qs))
        buffer = io.BytesIO()
        df.to_excel(buffer, index=False)
        buffer.seek(0)

        response = Response(buffer.read(), content_type="application/vnd.ms-excel")
        response['Content-Disposition'] = 'attachment; filename="disputes.xlsx"'
        return response
