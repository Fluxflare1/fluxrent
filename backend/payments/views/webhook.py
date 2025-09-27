import hmac, hashlib
from django.conf import settings
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from payments.models.webhook_event import WebhookEvent
from wallet.models.transaction import Transaction
from wallet.models.audit import AuditLog

class PaystackWebhookView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        signature = request.headers.get("x-paystack-signature")
        computed_sig = hmac.new(
            key=settings.PAYSTACK_SECRET_KEY.encode("utf-8"),
            msg=request.body,
            digestmod=hashlib.sha512
        ).hexdigest()

        if signature != computed_sig:
            return Response({"detail": "Invalid signature"}, status=400)

        event = request.data
        event_id = event.get("event", "") + "-" + str(event.get("data", {}).get("id"))

        # Log webhook
        webhook, created = WebhookEvent.objects.get_or_create(
            event_id=event_id,
            defaults={
                "event_type": event.get("event"),
                "payload": event,
            }
        )
        if not created:
            return Response({"detail": "Duplicate webhook"}, status=200)

        # Process only "charge.success" and "charge.failed"
        data = event.get("data", {})
        reference = data.get("reference")

        if event.get("event") == "charge.success":
            self.handle_success(reference, data, webhook)

        elif event.get("event") == "charge.failed":
            self.handle_failure(reference, data, webhook)

        return Response({"status": "ok"}, status=200)

    def handle_success(self, reference, data, webhook):
        try:
            txn = Transaction.objects.get(reference=reference)
            if txn.status != "success":
                txn.status = "success"
                txn.save()

            AuditLog.objects.create(
                reference=reference,
                action="reconciliation",
                details={"message": "Payment reconciled", "gateway": "Paystack", "amount": data.get("amount")}
            )
            webhook.mark_processed(success=True)
        except Transaction.DoesNotExist:
            AuditLog.objects.create(
                reference=reference,
                action="discrepancy",
                details={"message": "No matching transaction in system", "gateway": "Paystack", "amount": data.get("amount")}
            )
            webhook.mark_processed(success=False)

    def handle_failure(self, reference, data, webhook):
        AuditLog.objects.create(
            reference=reference,
            action="payment_failed",
            details={"message": "Payment failed", "gateway": "Paystack"}
        )
        webhook.mark_processed(success=True)
