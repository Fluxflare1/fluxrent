from django.db.models import Count, Sum
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Property, BoostPaymentLog


class BoostsTopView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        period = request.query_params.get("period", "monthly")
        qs = BoostPaymentLog.objects.values("property__title").annotate(
            count=Count("id"), total=Sum("amount")
        ).order_by("-count")[:10]
        return Response(list(qs))


class BoostsRevenueView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = BoostPaymentLog.objects.aggregate(total=Sum("amount"))
        return Response(qs)
