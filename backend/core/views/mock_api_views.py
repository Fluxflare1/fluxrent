# backend/core/views/mock_api_views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# --- USERS ---
def users_list(request):
    data = [
        {"id": "u_1", "email": "admin@example.com", "name": "Admin User", "role": "admin", "status": "approved"},
        {"id": "u_2", "email": "tenant@example.com", "name": "Tenant User", "role": "tenant", "status": "approved"},
    ]
    return JsonResponse(data, safe=False)

def user_by_id(request, user_id):
    return JsonResponse({"id": user_id, "email": f"user{user_id}@example.com", "name": "Demo User", "role": "tenant"})

def user_by_email(request):
    email = request.GET.get("email")
    return JsonResponse({"id": "u_99", "email": email, "name": "Stub User", "role": "tenant"})

@csrf_exempt
def upsert_user(request):
    if request.method == "POST":
        body = json.loads(request.body.decode("utf-8"))
        return JsonResponse({"success": True, "user": body})
    return JsonResponse({"error": "POST required"}, status=400)

@csrf_exempt
def verify_password(request):
    if request.method == "POST":
        body = json.loads(request.body.decode("utf-8"))
        return JsonResponse({"success": True, "email": body.get("email")})
    return JsonResponse({"error": "POST required"}, status=400)

# --- TENANTS ---
def tenants_list(request):
    return JsonResponse([{"id": "t_1", "name": "Tenant A"}, {"id": "t_2", "name": "Tenant B"}], safe=False)

# --- BILLS ---
def bills_list(request):
    return JsonResponse([{"id": "b_1", "amount": 500, "status": "unpaid"}], safe=False)

@csrf_exempt
def add_bill(request):
    if request.method == "POST":
        body = json.loads(request.body.decode("utf-8"))
        return JsonResponse({"success": True, "bill": body})
    return JsonResponse({"error": "POST required"}, status=400)

# --- AGREEMENTS ---
def agreements_list(request):
    return JsonResponse([{"id": "a_1", "tenant": "Tenant A", "status": "active"}], safe=False)

@csrf_exempt
def add_agreement(request):
    if request.method == "POST":
        body = json.loads(request.body.decode("utf-8"))
        return JsonResponse({"success": True, "agreement": body})
    return JsonResponse({"error": "POST required"}, status=400)

# --- PREPAYMENTS ---
def prepayments_list(request):
    return JsonResponse([{"id": "p_1", "amount": 200, "status": "confirmed"}], safe=False)

@csrf_exempt
def add_prepayment(request):
    if request.method == "POST":
        body = json.loads(request.body.decode("utf-8"))
        return JsonResponse({"success": True, "prepayment": body})
    return JsonResponse({"error": "POST required"}, status=400)

# --- DASHBOARD ---
def dashboard_stats(request):
    data = {
        "users": 12,
        "tenants": 5,
        "bills": {"pending": 4, "paid": 10},
        "agreements": 3,
    }
    return JsonResponse(data)
