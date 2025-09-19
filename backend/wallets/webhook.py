from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from .models import Wallet, WalletTransaction


@method_decorator(csrf_exempt, name="dispatch")
class PaystackWebhookView(APIView):
    """
    Skeleton webhook handler for Paystack
    """

    def post(self, request, *args, **kwargs):
        event = json.loads(request.body.decode("utf-8"))

        if event.get("event") == "charge.success":
            data = event.get("data", {})
            amount = int(data.get("amount", 0)) / 100  # Paystack sends in kobo
            reference = data.get("reference")
            customer_code = data.get("customer", {}).get("customer_code")

            try:
                wallet = Wallet.objects.get(customer_code=customer_code)
                wallet.balance += amount
                wallet.save()

                WalletTransaction.objects.create(
                    wallet=wallet,
                    amount=amount,
                    type="CREDIT",
                    source="PAYSTACK",
                    reference=reference,
                    status="SUCCESS",
                )
            except Wallet.DoesNotExist:
                return Response({"detail": "Wallet not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"status": "ok"}, status=status.HTTP_200_OK)
