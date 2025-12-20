from datetime import datetime
from dateutil.relativedelta import relativedelta
from collections import OrderedDict

from django.db.models import Sum, Count
from django.utils import timezone
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .permissions import IsPlatformAdmin
from .serializers import AuditLogSerializer, BroadcastTemplateSerializer, PlatformSettingSerializer
from .models import AuditLog, BroadcastTemplate, PlatformSetting
from .utils import log_admin_action

# NOTE: We attempt to import commonly-named models from your existing apps.
# If your project uses different model paths, update the import lines below accordingly.

try:
    # likely places — adapt if your names differ
    from payments.models import Transaction as PaymentTransaction
except Exception:
    PaymentTransaction = None

try:
    from wallet.models import Transaction as WalletTransaction
except Exception:
    WalletTransaction = None

try:
    from properties.models import BoostPurchase, Property
except Exception:
    BoostPurchase = None
    Property = None

try:
    from users.models import User
except Exception:
    User = None


def _parse_date_range(request):
    """
    Accepts ?start=YYYY-MM-DD&end=YYYY-MM-DD
    Returns (start_datetime, end_datetime) (timezone-aware)
    Defaults to last 6 months.
    """
    end = request.query_params.get("end")
    start = request.query_params.get("start")

    tz = timezone.get_current_timezone()
    if end:
        try:
            end_dt = tz.localize(datetime.fromisoformat(end))
        except Exception:
            end_dt = timezone.now()
    else:
        end_dt = timezone.now()

    if start:
        try:
            start_dt = tz.localize(datetime.fromisoformat(start))
        except Exception:
            start_dt = end_dt - relativedelta(months=6)
    else:
        start_dt = end_dt - relativedelta(months=6)

    # Normalize: start at 00:00, end at 23:59
    start_dt = datetime(start_dt.year, start_dt.month, 1, tzinfo=tz)
    end_dt = datetime(end_dt.year, end_dt.month, 1, tzinfo=tz) + relativedelta(months=1, days=-1)
    return start_dt, end_dt


class RevenueTrendAPIView(APIView):
    """
    GET /api/platform-admin/stats/revenue/?start=YYYY-MM-DD&end=YYYY-MM-DD
    Returns monthly aggregation (month YYYY-MM, amount)
    Uses payments.Transaction and/or wallets.Transaction where available.
    """
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get(self, request):
        start_dt, end_dt = _parse_date_range(request)
        # Build monthly buckets
        dates = []
        cur = start_dt
        while cur <= end_dt:
            dates.append(cur.strftime("%Y-%m"))
            cur = cur + relativedelta(months=1)

        # Try payments model first, fallback to wallet transactions
        qs = None
        if PaymentTransaction is not None:
            qs = PaymentTransaction.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt, status__in=["success","COMPLETED","completed"]) if hasattr(PaymentTransaction, "status") else PaymentTransaction.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt)
            # assume there is an `amount` field
            agg = qs.annotate(month=(
                # database-independent month string
                ).values_list("created_at", flat=True)
            )

        # We'll use raw aggregation by month using Django annotate
        data_map = OrderedDict((d, 0) for d in dates)

        source_qs = None
        if PaymentTransaction is not None:
            source_qs = PaymentTransaction.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt)
            # prefer numeric fields named amount or total
            amount_field = "amount" if hasattr(PaymentTransaction, "amount") else ( "total" if hasattr(PaymentTransaction, "total") else None)
        elif WalletTransaction is not None:
            source_qs = WalletTransaction.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt)
            amount_field = "amount" if hasattr(WalletTransaction, "amount") else ("value" if hasattr(WalletTransaction, "value") else None)
        else:
            return Response({"detail": "No transaction model found. Please adapt platform_admin.views to import your payments/wallets models."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if amount_field is None:
            return Response({"detail": "Transaction model missing expected numeric field (amount/total/value). Update code accordingly."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Aggregate by year-month
        from django.db.models.functions import TruncMonth
        agg_qs = source_qs.annotate(month=TruncMonth("created_at")).values("month").annotate(total=Sum(amount_field)).order_by("month")
        for entry in agg_qs:
            month_key = entry["month"].strftime("%Y-%m")
            data_map[month_key] = float(entry["total"] or 0)

        return Response({"start": start_dt, "end": end_dt, "series": [{"month": k, "amount": v} for k, v in data_map.items()]})


class UserGrowthAPIView(APIView):
    """
    GET /api/platform-admin/stats/users/?start=&end=
    Returns new users per month.
    """
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get(self, request):
        start_dt, end_dt = _parse_date_range(request)
        if User is None:
            return Response({"detail": "User model not found. Adjust imports in platform_admin/views.py."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        from django.db.models.functions import TruncMonth
        qs = User.objects.filter(date_joined__gte=start_dt, date_joined__lte=end_dt)
        agg_qs = qs.annotate(month=TruncMonth("date_joined")).values("month").annotate(new_users=Count("id")).order_by("month")

        # Build map of months
        dates = []
        cur = start_dt
        while cur <= end_dt:
            dates.append(cur.strftime("%Y-%m"))
            cur = cur + relativedelta(months=1)
        data_map = OrderedDict((d, 0) for d in dates)
        for entry in agg_qs:
            month_key = entry["month"].strftime("%Y-%m")
            data_map[month_key] = int(entry["new_users"] or 0)

        return Response({"start": start_dt, "end": end_dt, "series": [{"month": k, "count": v} for k, v in data_map.items()]})


class TopBoostedPropertiesAPIView(APIView):
    """
    GET /api/platform-admin/stats/top-boosts/?start=&end=&limit=10
    Returns top properties by boost revenue.
    Requires BoostPurchase or equivalent model to exist in properties app.
    """
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get(self, request):
        start_dt, end_dt = _parse_date_range(request)
        limit = int(request.query_params.get("limit", 10))

        if BoostPurchase is None or Property is None:
            return Response({"detail": "BoostPurchase/Property models not found. Update imports."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Assume BoostPurchase has fields: property (FK), amount, created_at
        from django.db.models.functions import TruncMonth
        qs = BoostPurchase.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt)
        agg = qs.values("property_id").annotate(revenue=Sum("amount")).order_by("-revenue")[:limit]

        results = []
        prop_ids = [a["property_id"] for a in agg]
        props = {p.id: p for p in Property.objects.filter(id__in=prop_ids)}
        for row in agg:
            pid = row["property_id"]
            prop = props.get(pid)
            results.append({
                "property_id": pid,
                "title": getattr(prop, "title", str(pid)),
                "revenue": float(row["revenue"] or 0)
            })

        return Response({"start": start_dt, "end": end_dt, "results": results})


# Simple management endpoints for audit logs and templates
class AuditLogViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    serializer_class = AuditLogSerializer
    queryset = AuditLog.objects.all().order_by("-created_at")
    # filtering and pagination can be added (DjangoFilterBackend etc.)


class BroadcastTemplateViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    serializer_class = BroadcastTemplateSerializer
    queryset = BroadcastTemplate.objects.all().order_by("-created_at")

    def perform_create(self, serializer):
        obj = serializer.save(created_by=self.request.user)
        log_admin_action(self.request.user, "create_broadcast_template", object_repr=obj.name, data={"id": obj.id}, ip_address=self.request.META.get("REMOTE_ADDR"))


class PlatformSettingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]
    serializer_class = PlatformSettingSerializer
    queryset = PlatformSetting.objects.all().order_by("key")

    @action(detail=False, methods=["get"])
    def by_key(self, request):
        key = request.query_params.get("key")
        if not key:
            return Response({"detail": "key required"}, status=status.HTTP_400_BAD_REQUEST)
        obj = get_object_or_404(PlatformSetting, key=key)
        serializer = self.get_serializer(obj)
        return Response(serializer.data)
