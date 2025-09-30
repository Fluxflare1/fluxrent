every line of code below is very important  but we have some duplicates. can you incorporate  code 2 into code 1 without  adding personal input or generic input. just filter and pick what's in code 2 that is not in code 1. 
Just work based on my instructions, not just what you think or feel or assume: 


code 1 (existing code)


# backend/wallet/views_paystack.py
import json
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction
from .services.paystack import create_customer, create_dedicated_account, verify_webhook_signature, verify_transaction, PaystackError
from .models import Wallet, WalletTransaction, PaystackCustomer, DedicatedVirtualAccount
from .serializers import PaystackCreateCustomerSerializer, PaystackAssignDvaSerializer, PaystackDvaSerializer

# Helper to fetch wallet by id and ensure ownership (used in endpoints)
def _get_wallet_owned_by_user(wallet_id: int, user):
    try:
        return Wallet.objects.get(id=wallet_id, user=user)
    except Wallet.DoesNotExist:
        return None


class CreatePaystackCustomerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaystackCreateCustomerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # call Paystack
        try:
            ps_data = create_customer(
                email=data["email"],
                first_name=data.get("first_name"),
                last_name=data.get("last_name"),
                phone=data.get("phone"),
            )
        except PaystackError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        customer_code = ps_data.get("customer_code") or ps_data.get("id") or ps_data.get("customer_code")
        if not customer_code:
            return Response({"detail": "Paystack returned unexpected customer payload"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Persist mapping
        obj, created = PaystackCustomer.objects.update_or_create(
            user=request.user,
            defaults={
                "customer_code": customer_code,
                "email": data["email"],
                "phone": data.get("phone") or "",
            },
        )
        return Response({"customer": {"customer_code": customer_code, "created": created, "raw": ps_data}}, status=status.HTTP_201_CREATED)


class CreateDedicatedAccountView(APIView):
    """
    Assign/create a dedicated virtual account for a given Wallet (owned by the user).
    Only the wallet owner (or staff/system) should call this.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaystackAssignDvaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        wallet_id = serializer.validated_data["wallet_id"]
        preferred_bank = serializer.validated_data.get("preferred_bank")

        wallet = _get_wallet_owned_by_user(wallet_id, request.user)
        if not wallet:
            return Response({"detail": "Wallet not found or access denied"}, status=status.HTTP_404_NOT_FOUND)

        # Ensure PaystackCustomer exists for the user
        try:
            ps_customer = request.user.paystack_customer
            customer_code = ps_customer.customer_code
        except PaystackCustomer.DoesNotExist:
            return Response({"detail": "Paystack customer not found for user. Create a customer first."}, status=status.HTTP_400_BAD_REQUEST)

        # call Paystack create_dedicated_account
        try:
            dva_data = create_dedicated_account(customer=customer_code, preferred_bank=preferred_bank)
        except PaystackError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        # Example payload structure: data.account_number, data.bank.name, data.id, data.customer etc (docs vary)
        paystack_id = dva_data.get("id") or dva_data.get("id")
        account_number = (dva_data.get("account_number") or dva_data.get("assigned_account") or None)
        bank = None
        bank_info = dva_data.get("bank")
        if bank_info:
            bank = bank_info.get("name") or bank_info.get("slug")

        if not account_number:
            # some responses nest details; try to find in nested structures
            # e.g., dva_data["data"]["account_number"], or assignment
            account_number = dva_data.get("data", {}).get("account_number") or dva_data.get("account_number")

        if not account_number:
            # fallback: try 'nuban' or 'assigned' fields
            account_number = dva_data.get("nuban") or dva_data.get("account", {}).get("number") if isinstance(dva_data.get("account"), dict) else None

        if not account_number:
            return Response({"detail": "Paystack response missing account_number"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Persist DVA and link to wallet
        with transaction.atomic():
            dva_obj, created = DedicatedVirtualAccount.objects.update_or_create(
                wallet=wallet,
                defaults={
                    "paystack_id": str(paystack_id),
                    "account_number": str(account_number),
                    "bank_name": bank,
                    "currency": dva_data.get("currency", "NGN"),
                    "metadata": dva_data.get("metadata", None),
                },
            )
            wallet.account_number = account_number
            wallet.paystack_account_id = str(paystack_id)
            wallet.save(update_fields=["account_number", "paystack_account_id"])

        return Response({"dedicated_account": PaystackDvaSerializer(dva_obj).data}, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name="dispatch")
class PaystackWebhookView(APIView):
    """
    Endpoint to receive Paystack webhooks.

    Security:
    - Validates request signature (x-paystack-signature) using PAYSTACK_SECRET_KEY
    - Idempotent handling: uses 'reference' where possible
    """
    permission_classes = [permissions.AllowAny]  # Paystack won't authenticate via JWT
    authentication_classes = []  # no auth

    def post(self, request, *args, **kwargs):
        # Raw body for signature verification
        raw_body = request.body or b""
        header_sig = request.META.get("HTTP_X_PAYSTACK_SIGNATURE") or request.META.get("X_PAYSTACK_SIGNATURE") or request.META.get("x-paystack-signature")

        if not header_sig:
            # reject — signature required
            return HttpResponse(status=400)

        try:
            valid = verify_webhook_signature(raw_body, header_sig)
        except Exception:
            valid = False

        if not valid:
            return HttpResponse(status=400)

        payload = request.data  # parsed JSON
        event = payload.get("event") or payload.get("type") or ""
        data = payload.get("data") or {}

        # We'll handle charge.success and transfer.success (DVA relevant)
        # For DVA transfers, Paystack sends charge.success / transfer events where data.authorization.channel == "dedicated_nuban" or authorization.channel == "transfer"
        try:
            if event in ("charge.success", "charge.successed", "charge.succeeded"):
                # handle dedicated_nuban channel
                auth = data.get("authorization") or {}
                channel = auth.get("channel") or data.get("channel")
                # amount is often in kobo => Paystack uses amount in kobo for NGN; some endpoints provide in naira
                amount_kobo = data.get("amount")
                # Prefer reference fields
                reference = data.get("reference") or data.get("id") or data.get("domain") or None
                # Extract receiver account number
                receiver_acc = None
                if isinstance(auth, dict):
                    receiver_acc = auth.get("receiver_bank_account_number") or auth.get("receiver_account") or auth.get("receiver_bank_account_number")
                # fallback: try data.meta or data.destination
                if not receiver_acc:
                    receiver_acc = data.get("recipient") or (data.get("destination") and data.get("destination").get("account_number"))

                # Convert amount to decimal NGN if in kobo
                amount = None
                if isinstance(amount_kobo, int):
                    # Paystack returns integer amount in kobo for NGN, e.g., 100000 -> ₦1000.00
                    amount = Decimal(amount_kobo) / Decimal(100)
                else:
                    # attempt float -> Decimal
                    try:
                        amount = Decimal(str(amount_kobo)) / Decimal(100)
                    except Exception:
                        amount = Decimal(str(amount_kobo or "0"))

                # Only credit if channel indicates dedicated_nuban OR receiver_acc matches known DVA account numbers
                credited = False
                if receiver_acc:
                    try:
                        dva = DedicatedVirtualAccount.objects.select_related("wallet").get(account_number=str(receiver_acc))
                    except DedicatedVirtualAccount.DoesNotExist:
                        dva = None

                    if dva:
                        # Make idempotent credit using reference (prefer using data.reference)
                        ref = reference or f"paystack:{data.get('id')}"
                        desc = f"Paystack DVA credit - event {event}"
                        # Use WalletTransaction.credit_wallet_idempotent
                        txn, created = WalletTransaction.credit_wallet_idempotent(
                            wallet=dva.wallet,
                            amount=amount,
                            reference=ref,
                            description=desc,
                            txn_type="fund",
                        )
                        credited = created or (txn is not None)

                # Respond success whether or not we matched a wallet (to prevent Paystack retries), but log if unmatched
                return JsonResponse({"status": True, "credited": bool(credited)}, status=200)

            elif event in ("transfer.success", "transfer.succeeded", "transfer.completed"):
                # transfer events (could be used depending on DVA flows)
                # Implementation similar to charge.success: try to find receiver account and credit wallet
                receiver = data.get("recipient") or data.get("receiver") or {}
                account_number = None
                if isinstance(receiver, dict):
                    account_number = receiver.get("account_number") or receiver.get("account")
                else:
                    account_number = receiver

                amount = data.get("amount")
                if isinstance(amount, int):
                    amount = Decimal(amount) / Decimal(100)
                else:
                    try:
                        amount = Decimal(str(amount))
                    except Exception:
                        amount = Decimal("0")

                credited = False
                if account_number:
                    try:
                        dva = DedicatedVirtualAccount.objects.select_related("wallet").get(account_number=str(account_number))
                    except DedicatedVirtualAccount.DoesNotExist:
                        dva = None

                    if dva:
                        ref = data.get("reference") or f"paystack_transfer:{data.get('id')}"
                        desc = f"Paystack transfer credit - event {event}"
                        txn, created = WalletTransaction.credit_wallet_idempotent(
                            wallet=dva.wallet,
                            amount=amount,
                            reference=ref,
                            description=desc,
                            txn_type="fund",
                        )
                        credited = created or (txn is not None)

                return JsonResponse({"status": True, "credited": bool(credited)}, status=200)

            else:
                # other events ignored but return 200
                return JsonResponse({"status": True, "ignored_event": event}, status=200)

        except Exception as exc:
            # Avoid returning 500 to Paystack — log and return 200/400 accordingly
            # In production, log exception to Sentry / logger
            return JsonResponse({"status": False, "error": str(exc)}, status=200)







code 2 (new code to be added)
# backend/wallet/views_paystack.py
import json, hashlib, hmac
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from properties.models import Property, BoostPaymentLog
from properties.views import ConfirmExternalBoostView


@method_decorator(csrf_exempt, name="dispatch")
class PaystackWebhookView(APIView):
    """
    Handle Paystack webhook → confirm external boosts, wallet funding, etc.
    """

    def post(self, request, *args, **kwargs):
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

        metadata = payload.get("metadata", {})
        reference_type = metadata.get("reference_type")
        property_id = metadata.get("property_id")
        agent_id = metadata.get("agent_id")

        # Log it
        BoostPaymentLog.objects.create(
            reference=payload.get("reference"),
            amount=payload.get("amount", 0) / 100,
            property_id=property_id,
            agent_id=agent_id,
            raw=data,
        )

        if event == "charge.success" and reference_type == "boost":
            # Call confirm boost
            view = ConfirmExternalBoostView.as_view()
            return view(request._request, property_id=property_id, agent_id=agent_id)

        return Response({"status": "ignored"}, status=200)
