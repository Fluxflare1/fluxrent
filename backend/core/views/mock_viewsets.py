# backend/core/views/mock_viewsets.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .serializers import mock_serializers as s

# ---- Existing ViewSets (Users, Tenants, Bills, Agreements, Prepayments, Dashboard) ----
# ... (keep previous ones unchanged)

# ---- New ----
class PropertyViewSet(viewsets.ViewSet):
    def list(self, request):
        data = [
            {"id": "p_1", "name": "Green Villa", "location": "Lagos"},
            {"id": "p_2", "name": "Blue Estate", "location": "Abuja"},
        ]
        return Response(s.PropertySerializer(data, many=True).data)

    def create(self, request):
        return Response({"success": True, "property": request.data}, status=status.HTTP_201_CREATED)


class ApartmentViewSet(viewsets.ViewSet):
    def list(self, request):
        data = [
            {"id": "a_1", "property_id": "p_1", "unit_number": "101", "status": "occupied"},
            {"id": "a_2", "property_id": "p_1", "unit_number": "102", "status": "vacant"},
        ]
        return Response(s.ApartmentSerializer(data, many=True).data)

    def create(self, request):
        return Response({"success": True, "apartment": request.data}, status=status.HTTP_201_CREATED)


class UtilityViewSet(viewsets.ViewSet):
    def list(self, request):
        data = [{"id": "u_1", "name": "Water", "cost": 30.0}, {"id": "u_2", "name": "Electricity", "cost": 50.0}]
        return Response(s.UtilitySerializer(data, many=True).data)

    def create(self, request):
        return Response({"success": True, "utility": request.data}, status=status.HTTP_201_CREATED)


class TemplateViewSet(viewsets.ViewSet):
    def list(self, request):
        data = [{"id": "t_1", "title": "Rent Reminder", "body": "Please pay your rent."}]
        return Response(s.TemplateSerializer(data, many=True).data)

    def create(self, request):
        return Response({"success": True, "template": request.data}, status=status.HTTP_201_CREATED)


class NotificationViewSet(viewsets.ViewSet):
    def list(self, request):
        data = [{"id": "n_1", "message": "Payment received", "type": "info"}]
        return Response(s.NotificationSerializer(data, many=True).data)

    def create(self, request):
        return Response({"success": True, "notification": request.data}, status=status.HTTP_201_CREATED)
