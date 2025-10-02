# backend/owner/views.py
import logging
from datetime import datetime, date
from decimal import Decimal
from typing import List, Dict, Optional

from django.conf import settings
from django.apps import apps
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework import status
from users.models import User
from properties.models import Property
from wallets.models import Transaction
from .models import PlatformSetting, AdminActionLog
from notifications.utils import send_notification
from .serializers import (
    UserSerializer, PropertySerializer, TransactionSerializer, 
    PlatformSettingSerializer, RevenueTrendSerializer, 
    UserGrowthSerializer, TopBoostedPropertySerializer,
    MonthValueSerializer, TopBoostPropertySerializer
)

class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "owner"

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsOwner]

    @action(detail=False, methods=["get"])
    def summary(self, request):
        users_count = User.objects.count()
        properties_count = Property.objects.count()
        revenue = Transaction.objects.filter(status="success").aggregate(total=Sum("amount"))["total"] or 0
        return Response({
            "users": users_count,
            "properties": properties_count,
            "revenue": revenue
        })

    @action(detail=False, methods=["get"])
    def revenue_breakdown(self, request):
        qs = Transaction.objects.filter(status="success").values("type").annotate(total=Sum("amount"))
        return Response(list(qs))

class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsOwner]

    @action(detail=True, methods=["post"])
    def suspend(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({"status": "suspended"})

    @action(detail=True, methods=["post"])
    def verify_kyc(self, request, pk=None):
        user = self.get_object()
        user.kyc_verified = True
        user.save()
        return Response({"status": "kyc_verified"})

class PropertyManagementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Property.objects.all().order_by("-boost_until")
    serializer_class = PropertySerializer
    permission_classes = [IsOwner]

class PlatformSettingViewSet(viewsets.ModelViewSet):
    queryset = PlatformSetting.objects.all()
    serializer_class = PlatformSettingSerializer
    permission_classes = [IsOwner]

class NotificationBroadcastViewSet(viewsets.ViewSet):
    permission_classes = [IsOwner]

    @action(detail=False, methods=["post"])
    def broadcast(self, request):
        target = request.data.get("target", "all")
        message = request.data.get("message")
        channel = request.data.get("channel", "email")

        if not message:
            return Response({"error": "Message required"}, status=400)

        qs = User.objects.all()
        if target == "tenants":
            qs = qs.filter(role="tenant")
        elif target == "managers":
            qs = qs.filter(role="manager")
        elif target == "agents":
            qs = qs.filter(role="agent")

        recipients = [u.email for u in qs if u.email]

        send_notification(channel=channel, recipients=recipients, message=message)

        AdminActionLog.objects.create(
            actor=request.user,
            action="broadcast",
            details={"target": target, "channel": channel, "message": message},
        )

        return Response({"status": "sent", "recipients": len(recipients)})

logger = logging.getLogger(__name__)

BOOST_MODEL_SETTING = getattr(settings, "OWNER_STATS_BOOST_MODEL", "boosts.BoostPurchase")
PROPERTY_MODEL_SETTING = getattr(settings, "OWNER_STATS_PROPERTY_MODEL", "properties.Property")
USER_MODEL_SETTING = getattr(settings, "OWNER_STATS_USER_MODEL", "auth.User")

def _get_model(model_path: str):
    try:
        app_label, model_name = model_path.split(".")
        model = apps.get_model(app_label, model_name)
        if model is None:
            logger.warning("Model %s returned None from apps.get_model", model_path)
        return model
    except Exception as exc:
        logger.exception("Failed to load model %s: %s", model_path, exc)
        return None

def _parse_date_param(val: Optional[str]) -> Optional[date]:
    if not val:
        return None
    val = val.strip()
    try:
        if len(val) == 7:
            return date.fromisoformat(val + "-01")
        return date.fromisoformat(val)
    except Exception:
        try:
            return datetime.fromisoformat(val).date()
        except Exception:
            return None

def _last_n_months(n: int) -> List[date]:
    now = timezone.localtime(timezone.now())
    year = now.year
    month = now.month
    months = []
    for i in range(n - 1, -1, -1):
        m = month - i
        y = year
        while m <= 0:
            m += 12
            y -= 1
        months.append(date(y, m, 1))
    return months

class RevenueStatsView(APIView):
    permission_classes = [IsOwner]

    def get(self, request, *args, **kwargs):
        boost_model = _get_model(BOOST_MODEL_SETTING)
        if not boost_model:
            return Response([], status=status.HTTP_200_OK)

        start_date = _parse_date_param(request.query_params.get("start_date"))
        end_date = _parse_date_param(request.query_params.get("end_date"))

        months = _last_n_months(6)
        month_map: Dict[str, float] = {m.strftime("%Y-%m"): 0.0 for m in months}

        try:
            qs = boost_model.objects.all()
            if start_date:
                qs = qs.filter(created_at__date__gte=start_date)
            if end_date:
                qs = qs.filter(created_at__date__lte=end_date)

            annotated = (
                qs.annotate(month=TruncMonth("created_at"))
                .values("month")
                .annotate(revenue=Sum("amount"))
                .order_by("month")
            )

            for row in annotated:
                month_dt = row.get("month")
                if month_dt:
                    key = month_dt.strftime("%Y-%m")
                    if key in month_map:
                        val = row.get("revenue") or 0
                        month_map[key] = float(val) if isinstance(val, Decimal) else float(val or 0)

            result = [{"month": k, "value": month_map[k]} for k in sorted(month_map.keys())]
            serializer = MonthValueSerializer(result, many=True)
            return Response(serializer.data)
        except Exception as exc:
            logger.exception("Error computing revenue stats: %s", exc)
            return Response({"detail": "Server error computing revenue"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserGrowthView(APIView):
    permission_classes = [IsOwner]

    def get(self, request, *args, **kwargs):
        user_model = _get_model(USER_MODEL_SETTING)
        if not user_model:
            return Response([], status=status.HTTP_200_OK)

        start_date = _parse_date_param(request.query_params.get("start_date"))
        end_date = _parse_date_param(request.query_params.get("end_date"))

        try:
            qs = user_model.objects.all()
            if start_date:
                qs = qs.filter(date_joined__date__gte=start_date)
            if end_date:
                qs = qs.filter(date_joined__date__lte=end_date)

            annotated = (
                qs.annotate(month=TruncMonth("date_joined"))
                .values("month")
                .annotate(count=Count("id"))
                .order_by("month")
            )

            months = _last_n_months(6)
            if start_date and end_date:
                months = []
                cur = date(start_date.year, start_date.month, 1)
                last = date(end_date.year, end_date.month, 1)
                while cur <= last:
                    months.append(cur)
                    y, m = cur.year, cur.month + 1
                    if m > 12:
                        m = 1
                        y += 1
                    cur = date(y, m, 1)
            month_map: Dict[str, int] = {m.strftime("%Y-%m"): 0 for m in months}

            for row in annotated:
                month_dt = row.get("month")
                if month_dt:
                    key = month_dt.strftime("%Y-%m")
                    if key in month_map:
                        month_map[key] = int(row.get("count", 0) or 0)

            result = [{"month": k, "value": month_map[k]} for k in sorted(month_map.keys())]
            serializer = MonthValueSerializer(result, many=True)
            return Response(serializer.data)
        except Exception as exc:
            logger.exception("Error computing user growth stats: %s", exc)
            return Response({"detail": "Server error computing user growth"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TopBoostsView(APIView):
    permission_classes = [IsOwner]

    def get(self, request, *args, **kwargs):
        boost_model = _get_model(BOOST_MODEL_SETTING)
        property_model = _get_model(PROPERTY_MODEL_SETTING)
        if not boost_model or not property_model:
            return Response([], status=status.HTTP_200_OK)

        start_date = _parse_date_param(request.query_params.get("start_date"))
        end_date = _parse_date_param(request.query_params.get("end_date"))
        limit = int(request.query_params.get("limit", 10))

        try:
            qs = boost_model.objects.all()
            if start_date:
                qs = qs.filter(created_at__date__gte=start_date)
            if end_date:
                qs = qs.filter(created_at__date__lte=end_date)

            fk_name = None
            for f in boost_model._meta.get_fields():
                if getattr(f, "is_relation", False) and getattr(f, "many_to_one", False):
                    if f.name in ("property", "listing"):
                        fk_name = f.name
                        break
                    if fk_name is None:
                        fk_name = f.name

            if not fk_name:
                logger.warning("No FK to property found in %s", boost_model)
                return Response([], status=status.HTTP_200_OK)

            prop_id_field = f"{fk_name}__id"
            aggregated = (
                qs.values(prop_id_field)
                .annotate(revenue=Sum("amount"))
                .order_by("-revenue")[:limit]
            )

            results = []
            for item in aggregated:
                prop_id = item.get(prop_id_field)
                revenue = item.get("revenue") or 0
                title = ""
                try:
                    prop = property_model.objects.filter(id=prop_id).first()
                    title = getattr(prop, "title", "") if prop else ""
                except Exception:
                    title = ""
                results.append({
                    "property_id": int(prop_id) if prop_id is not None else None, 
                    "title": str(title or ""), 
                    "revenue": float(revenue) if isinstance(revenue, Decimal) else float(revenue or 0)
                })

            serializer = TopBoostPropertySerializer(results, many=True)
            return Response(serializer.data)
        except Exception as exc:
            logger.exception("Error computing top boosts: %s", exc)
            return Response({"detail": "Server error computing top boosts"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
