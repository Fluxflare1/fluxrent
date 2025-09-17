from django.http import JsonResponse
from django.views import View

class PlatformDashboardView(View):
    def get(self, request, *args, **kwargs):
        # TODO: Replace with real DB queries later
        data = {
            "total_users": 1234,
            "active_users": 876,
            "total_properties": 540,
            "occupied_properties": 410,
            "monthly_recurring_revenue": 15800,
            "total_revenue": 93000,
            "user_evolution": [
                {"date": "2025-01-01", "count": 100},
                {"date": "2025-02-01", "count": 120},
                {"date": "2025-03-01", "count": 150},
            ],
            "revenue_trend": [
                {"month": "Jan", "revenue": 12000},
                {"month": "Feb", "revenue": 13800},
                {"month": "Mar", "revenue": 15800},
            ],
            "role_distribution": [
                {"name": "Tenant", "value": 800},
                {"name": "Agent", "value": 250},
                {"name": "Property Manager", "value": 150},
                {"name": "Super Admin", "value": 4},
            ],
            "recent_activity": [
                {
                    "id": 1,
                    "user_name": "Jane Doe",
                    "action": "created",
                    "target": "property #123",
                    "timestamp": "2025-09-01T12:34:56Z",
                },
                {
                    "id": 2,
                    "user_name": "John Smith",
                    "action": "updated",
                    "target": "tenant #456",
                    "timestamp": "2025-09-02T09:15:00Z",
                },
            ],
        }
        return JsonResponse(data)
