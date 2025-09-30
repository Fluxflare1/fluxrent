# backend/wallet/views_paystack.py
import json, hashlib, hmac
from decimal import Decimal
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import WalletTransaction, DedicatedVirtualAccount
from properties.models import BoostPaymentLog
from properties.views import ConfirmExternalBoostView


@method_decorator(csrf_exempt, name="dispatch")
class PaystackWebhookView(APIView):
    """
    Unified Paystack webhook:
    - Validates signature
    - Handles DVA wallet funding
    - Handles transfer credits
    - Handles external boosts (metadata.reference_type == "boost")
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        raw_body = request.body or b""
        signature = (
            request.headers.get("x-paystack-signature")
            or request.META.get("HTTP_X_PAYSTACK_SIGNATURE")
        )

        if not signature:
            return HttpResponse(status=400)

        expected_signature = hmac.new(
            settings.PAYSTACK_SECRET_KEY.encode("utf-8"),
            raw_body,
            hashlib.sha512,
        ).hexdigest()

        if signature != expected_signature:
            return HttpResponse(status=400)

        try:
            data = json.loads(raw_body.decode("utf-8"))
        except Exception:
            return HttpResponse(status=400)

        event = data.get("event", "")
        payload = data.get("data", {}) or {}

        try:
            # === Case 1: External Boost Payments ===
            metadata = payload.get("metadata") or {}
            reference_type = metadata.get("reference_type")
            if event == "charge.success" and reference_type == "boost":
                property_id = metadata.get("property_id")
                agent_id = metadata.get("agent_id")

                # Log boost
                BoostPaymentLog.objects.create(
                    reference=payload.get("reference"),
                    amount=Decimal(payload.get("amount", 0)) / Decimal(100),
                    property_id=property_id,
                    agent_id=agent_id,
                    raw=data,
                )

                # Confirm external boost
                view = ConfirmExternalBoostView.as_view()
                return view(request._request, property_id=property_id, agent_id=agent_id)

            # === Case 2: Wallet Funding via DVA ===
            if event.startswith("charge."):
                auth = payload.get("authorization") or {}
                channel = auth.get("channel") or payload.get("channel")
                amount_kobo = payload.get("amount")
                reference = payload.get("reference") or str(payload.get("id"))
                receiver_acc = (
                    auth.get("receiver_bank_account_number")
                    or auth.get("receiver_account")
                )

                amount = Decimal(amount_kobo) / Decimal(100) if isinstance(amount_kobo, int) else Decimal("0")

                credited = False
                if receiver_acc:
                    try:
                        dva = DedicatedVirtualAccount.objects.select_related("wallet").get(
                            account_number=str(receiver_acc)
                        )
                    except DedicatedVirtualAccount.DoesNotExist:
                        dva = None

                    if dva:
                        txn, created = WalletTransaction.credit_wallet_idempotent(
                            wallet=dva.wallet,
                            amount=amount,
                            reference=reference,
                            description=f"Paystack DVA credit - {event}",
                            txn_type="fund",
                        )
                        credited = created or txn is not None

                return JsonResponse({"status": True, "credited": bool(credited)}, status=200)

            # === Case 3: Transfers (optional support) ===
            if event.startswith("transfer."):
                receiver = payload.get("recipient") or payload.get("receiver") or {}
                account_number = receiver.get("account_number") if isinstance(receiver, dict) else receiver
                amount = payload.get("amount")
                if isinstance(amount, int):
                    amount = Decimal(amount) / Decimal(100)
                else:
                    amount = Decimal(str(amount or "0"))

                credited = False
                if account_number:
                    try:
                        dva = DedicatedVirtualAccount.objects.select_related("wallet").get(
                            account_number=str(account_number)
                        )
                    except DedicatedVirtualAccount.DoesNotExist:
                        dva = None

                    if dva:
                        ref = payload.get("reference") or f"paystack_transfer:{payload.get('id')}"
                        txn, created = WalletTransaction.credit_wallet_idempotent(
                            wallet=dva.wallet,
                            amount=amount,
                            reference=ref,
                            description=f"Paystack transfer credit - {event}",
                            txn_type="fund",
                        )
                        credited = created or txn is not None

                return JsonResponse({"status": True, "credited": bool(credited)}, status=200)

            # === Default: ignore event ===
            return JsonResponse({"status": True, "ignored_event": event}, status=200)

        except Exception as exc:
            # Never 500 to Paystack, always swallow but log
            # TODO: hook logger / Sentry
     
            return JsonResponse({"status": False, "error": str(exc)}, status=200)






import json, hashlib, hmac
from decimal import Decimal
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from properties.models import BoostPaymentLog
from properties.views import ConfirmExternalBoostView


@method_decorator(csrf_exempt, name="dispatch")
class PaystackWebhookView(APIView):
    """
    Handle Paystack webhook → confirm external boosts, wallet funding, etc.
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        # Verify signature
        signature = request.headers.get("x-paystack-signature")
        raw_body = request.body
        expected_signature = hmac.new(
            settings.PAYSTACK_SECRET_KEY.encode("utf-8"),
            raw_body,
            hashlib.sha512,
        ).hexdigest()

        if signature != expected_signature:
            return Response({"error": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)

        data = json.loads(raw_body.decode("utf-8"))
        event = data.get("event")
        payload = data.get("data", {})

        reference = payload.get("reference")
        amount_kobo = payload.get("amount", 0)
        amount = Decimal(amount_kobo) / 100 if amount_kobo else Decimal("0")

        metadata = payload.get("metadata", {}) or {}
        reference_type = metadata.get("reference_type")
        property_id = metadata.get("property_id")
        agent_id = metadata.get("agent_id")

        # Always try to fetch existing log and update
        log, _ = BoostPaymentLog.objects.get_or_create(
            reference=reference,
            defaults={
                "amount": amount,
                "property_id": property_id,
                "agent_id": agent_id,
                "status": "pending",
                "raw": data,
            },
        )

        # Update raw + amount (in case)
        log.raw = data
        log.amount = amount

        if event == "charge.success" and reference_type == "boost":
            log.status = "success"
            log.save(update_fields=["status", "amount", "raw"])

            # Trigger external boost confirmation
            view = ConfirmExternalBoostView.as_view()
            return view(request._request, property_id=property_id, agent_id=agent_id)

        elif event in ("charge.failed", "charge.failure"):
            log.status = "failed"
            log.save(update_fields=["status", "amount", "raw"])
            return Response({"status": "failed"}, status=200)

        else:
            # Unhandled event, keep log as pending or update raw
            log.save(update_fields=["amount", "raw"])
            return Response({"status": "ignored", "event": event}, status=200)
