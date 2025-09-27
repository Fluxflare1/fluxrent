from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.db import transaction as db_tx

from wallet.models.transaction import Transaction
from wallet.models.refund import Refund
from wallet.serializers.refund import RefundSerializer

class RefundViewSet(viewsets.ModelViewSet):
    queryset = Refund.objects.all()
    serializer_class = RefundSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        refund = self.get_object()
        if refund.status not in ["pending", "rejected"]:
            return Response({"detail": "Refund already processed"}, status=400)

        with db_tx.atomic():
            refund.status = "approved"
            refund.approved_by = request.user
            refund.save()

            # Create a reverse transaction entry
            txn = refund.transaction
            from wallet.models.transaction import Transaction
            Transaction.objects.create(
                wallet=txn.wallet,
                amount=-refund.amount,
                charge=-refund.charge,
                net_amount=-(refund.total_refund),
                reference=f"RFND-{txn.reference}",
                type="refund",
                status="success",
                meta={"original_txn": txn.reference}
            )

            refund.status = "completed"
            refund.save()

        return Response(RefundSerializer(refund).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        refund = self.get_object()
        if refund.status != "pending":
            return Response({"detail": "Refund already processed"}, status=400)

        refund.status = "rejected"
        refund.approved_by = request.user
        refund.save()
        return Response(RefundSerializer(refund).data, status=status.HTTP_200_OK)
