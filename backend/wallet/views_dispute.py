# backend/wallet/views_dispute.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models_dispute import Dispute, DisputeComment
from .serializers_dispute import DisputeSerializer, DisputeCommentSerializer
from wallet.models import WalletTransaction, Wallet
from wallet.models import WalletTransaction as WTModel  # already imported in models_dispute expectations
from wallet.models import WalletTransaction
from notifications.utils import notify_admins
from wallet.models import WalletTransaction  # ensure available
from decimal import Decimal

# permission helpers
class IsAdminOrOwner(permissions.BasePermission):
    """
    Object-level permission: owners can create/view own disputes; admins (platform_owner or is_staff) can view/act.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or getattr(request.user, "role", None) == "platform_owner":
            return True
        return obj.raised_by == request.user

class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS or request.user and request.user.is_authenticated:
            return True
        return False

class DisputeViewSet(viewsets.ModelViewSet):
    """
    Dispute management endpoints.
    - Users create disputes (link to WalletTransaction or external ref)
    - Admins can resolve, refund, add internal notes, etc.
    """
    queryset = Dispute.objects.all().select_related("raised_by", "wallet_transaction", "resolved_by")
    serializer_class = DisputeSerializer
    permission_classes = [IsAdminOrOwner]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, "role", None) == "platform_owner":
            return self.queryset
        return self.queryset.filter(raised_by=user)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def perform_create(self, serializer):
        dispute = serializer.save()
        # Notify admins on new dispute
        notify_admins(
            subject=f"New dispute {dispute.uid}",
            message=f"User {dispute.raised_by.email} created dispute {dispute.uid} for tx={getattr(dispute.wallet_transaction, 'uid', dispute.payment_reference)} amount={dispute.amount}"
        )

    @action(detail=True, methods=["post"], url_path="comment", permission_classes=[permissions.IsAuthenticated])
    def add_comment(self, request, pk=None):
        dispute = self.get_object()
        data = request.data
        serializer = DisputeCommentSerializer(data={
            "dispute": dispute.id,
            "author": request.user.id,
            "comment": data.get("comment"),
            "internal": bool(data.get("internal", False)) and (request.user.is_staff or getattr(request.user, "role", None) == "platform_owner")
        })
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(author=request.user, dispute=dispute)
        # notify admins on user comment on open disputes
        if not comment.internal:
            notify_admins(
                subject=f"Dispute comment on {dispute.uid}",
                message=f"{request.user.email} commented on dispute {dispute.uid}: {comment.comment[:250]}"
            )
        return Response(DisputeCommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="resolve", permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def resolve(self, request, pk=None):
        """
        Admin resolves a dispute. Payload: { action: "accept" | "reject", note: "..." }.
        If accept -> status becomes 'resolved'. Note: refunds are separate action (refund) if required.
        """
        user = request.user
        if not (user.is_staff or getattr(user, "role", None) == "platform_owner"):
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        dispute = self.get_object()
        action = request.data.get("action")
        note = request.data.get("note", "")

        if action not in ("accept", "reject"):
            return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

        new_status = "resolved" if action == "accept" else "rejected"
        dispute.mark_resolved(status=new_status, note=note, user=user)

        # notify user
        notify_admins(subject=f"Dispute {dispute.uid} resolved -> {new_status}", message=f"Resolved by {user.email}. Note: {note}")

        return Response(DisputeSerializer(dispute).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="refund", permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def refund(self, request, pk=None):
        """
        Admin issues manual refund for dispute. This will:
          - Create an idempotent credit to the user's wallet using WalletTransaction.credit_wallet_idempotent()
          - Create a DisputeComment with internal note and mark dispute status 'refunded'
        Payload: { amount?: decimal, reference?: str (optional custom refund ref), note?: str }
        """
        user = request.user
        if not (user.is_staff or getattr(user, "role", None) == "platform_owner"):
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        dispute = self.get_object()

        # Determine target wallet => prefer wallet_transaction.wallet, else try to find user's primary wallet
        target_wallet = None
        if dispute.wallet_transaction and dispute.wallet_transaction.wallet:
            target_wallet = dispute.wallet_transaction.wallet
        else:
            # try to find personal wallet for the user
            target_wallet = Wallet.objects.filter(user=dispute.raised_by, is_active=True).first()
            if not target_wallet:
                return Response({"detail": "No active wallet for user found to refund."}, status=status.HTTP_400_BAD_REQUEST)

        # amount to refund: prefer provided in payload -> dispute.amount -> tx.amount
        payload_amount = request.data.get("amount")
        try:
            if payload_amount is not None:
                amount = Decimal(str(payload_amount))
            elif dispute.amount is not None:
                amount = Decimal(dispute.amount)
            elif dispute.wallet_transaction is not None:
                amount = Decimal(dispute.wallet_transaction.amount)
            else:
                return Response({"detail": "Cannot infer refund amount"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({"detail": "Invalid amount format"}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({"detail": "Refund amount must be positive"}, status=status.HTTP_400_BAD_REQUEST)

        # idempotent reference: use dispute.uid as part of reference
        reference = request.data.get("reference") or f"refund:{dispute.uid}"

        # credit wallet idempotently
        try:
            txn_obj, created = WalletTransaction.credit_wallet_idempotent(
                wallet=target_wallet,
                amount=amount,
                reference=reference,
                description=f"Refund for dispute {dispute.uid} (initiated by {user.email})",
                txn_type="fund",
            )
        except Exception as exc:
            return Response({"detail": f"Failed to create refund: {str(exc)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # mark dispute as refunded/resolved
        dispute.mark_resolved(status="refunded", note=request.data.get("note", ""), user=user)

        # add internal comment
        DisputeComment.objects.create(
            dispute=dispute,
            author=user,
            comment=f"Refund issued: {amount} (ref {reference}). Note: {request.data.get('note', '')}",
            internal=True
        )

        # notify admins + user
        notify_admins(subject=f"Refund issued for {dispute.uid}", message=f"Refund {amount} issued to wallet {target_wallet.uid} (ref {reference}) by {user.email}")

        return Response({
            "dispute": DisputeSerializer(dispute).data,
            "refund_txn": {
                "uid": txn_obj.uid,
                "amount": str(txn_obj.amount),
                "reference": txn_obj.reference,
                "created": txn_obj.created_at,
            },
            "created": created
        }, status=status.HTTP_200_OK)
