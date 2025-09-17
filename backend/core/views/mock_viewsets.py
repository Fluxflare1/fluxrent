# backend/core/views/mock_viewsets.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .serializers import mock_serializers as s


class UserViewSet(viewsets.ViewSet):
    def list(self, request):
        data = [
            {"id": "u_1", "email": "admin@example.com", "name": "Admin User", "role": "admin", "status": "approved"},
            {"id": "u_2", "email": "tenant@example.com", "name": "Tenant User", "role": "tenant", "status": "approved"},
        ]
        return Response(s.UserSerializer(data, many=True).data)

    def retrieve(self, request, pk=None):
        data = {"id": pk, "email": f"user{pk}@example.com", "name": "Demo User", "role": "tenant", "status": "approved"}
        return Response(s.UserSerializer(data).data)

    @action(detail=False, methods=["get"])
    def by_email(self, request):
        email = request.query_params.get("email", "unknown@example.com")
        data = {"id": "u_99", "email": email, "name": "Stub User", "role": "tenant", "status": "approved"}
        return Response(s.UserSerializer(data).data)

    @action(detail=False, methods=["post"])
    def upsert(self, request):
        return Response({"success": True, "user": request.data}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="verify-password")
    def verify_password(self, request):
        return Response({"success": True, "email": request.data.get("email")})


class TenantViewSet(viewsets.ViewSet):
    def list(self, request):
        data = [{"id": "t_1", "name": "Tenant A"}, {"id": "t_2", "name": "Tenant B"}]
        return Response(s.TenantSerializer(data, many=True).data)


class BillViewSet(viewsets.ViewSet):
    def list(self, request):
        data = [{"id": "b_1", "amount": 500, "status": "unpaid"}]
        return Response(s.BillSerializer(data, many=True).data)

    def create(self, request):
        return Response({"success": True, "bill": request.data}, status=status.HTTP_201_CREATED)


class AgreementViewSet(viewsets.ViewSet):
    def list(self, request):
        data = [{"id": "a_1", "tenant": "Tenant A", "status": "active"}]
        return Response(s.AgreementSerializer(data, many=True).data)

    def create(self, request):
        return Response({"success": True, "agreement": request.data}, status=status.HTTP_201_CREATED)


class PrepaymentViewSet(viewsets.ViewSet):
    def list(self, request):
        data = [{"id": "p_1", "amount": 200, "status": "confirmed"}]
        return Response(s.PrepaymentSerializer(data, many=True).data)

    def create(self, request):
        return Response({"success": True, "prepayment": request.data}, status=status.HTTP_201_CREATED)


class DashboardViewSet(viewsets.ViewSet):
    def list(self, request):
        data = {
            "users": 12,
            "tenants": 5,
            "bills": {"pending": 4, "paid": 10},
            "agreements": 3,
        }
        return Response(s.DashboardSerializer(data).data)
