import requests
import uuid
from decimal import Decimal

from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Property, BoostPaymentLog


class InitiateBoostPaymentView(APIView):
    """
    Endpoint: POST /api/properties/boosts/initiate/
    Initiates Paystack transaction for boosting a property when wallet balance is insufficient.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        property_id = request.data.get("property_id")
        amount = request.data.get("amount")

        if not property_id or not amount:
            return Response(
                {"detail": "property_id and amount are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        property_obj = get_object_or_404(Property, id=property_id, agent=user)

        try:
            amount_decimal = Decimal(amount)
        except Exception:
            return Response({"detail": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        if amount_decimal <= 0:
            return Response({"detail": "Amount must be greater than zero"}, status=status.HTTP_400_BAD_REQUEST)

        # Paystack requires amount in kobo
        amount_kobo = int(amount_decimal * 100)

        # Generate internal reference
        internal_ref = f"boost_{uuid.uuid4().hex}"

        # Metadata to help webhook confirm
        metadata = {
            "reference_type": "boost",
            "property_id": str(property_obj.id),
            "agent_id": str(user.id),
            "internal_ref": internal_ref,
        }

        # Log before redirect
        BoostPaymentLog.objects.create(
            reference=internal_ref,
            amount=amount_decimal,
            property=property_obj,
            agent=user,
            status="pending",
        )

        # Call Paystack initialize transaction
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "email": user.email,
            "amount": amount_kobo,
            "reference": internal_ref,
            "callback_url": settings.PAYSTACK_CALLBACK_URL,  # e.g., frontend URL or backend callback
            "metadata": metadata,
        }

        try:
            resp = requests.post(
                "https://api.paystack.co/transaction/initialize",
                json=payload,
                headers=headers,
                timeout=30,
            )
            ps_data = resp.json()
        except Exception as exc:
            return Response(
                {"detail": f"Paystack init failed: {str(exc)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if not ps_data.get("status"):
            return Response(
                {"detail": ps_data.get("message", "Failed to init Paystack")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "authorization_url": ps_data["data"]["authorization_url"],
                "access_code": ps_data["data"]["access_code"],
                "reference": ps_data["data"]["reference"],
            },
            status=status.HTTP_200_OK,
        )
