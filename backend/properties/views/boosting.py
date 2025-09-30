# backend/properties/views/boosting.py
from rest_framework.views import APIView
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from django.utils import timezone

from properties.models.boost import BoostPackage, BoostPurchase
from properties.serializers.boosting import BoostPackageSerializer, BoostPurchaseCreateSerializer, BoostPurchaseSerializer
from wallet.models import Wallet, WalletTransaction

class IsPropertyOwnerOrAgent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # allow owner or agent or staff
        return obj.owner == request.user or (hasattr(obj, "agent") and obj.agent == request.user) or request.user.is_staff


class BoostPackageListView(generics.ListAPIView):
    queryset = BoostPackage.objects.filter(active=True).order_by("-price")
    serializer_class = BoostPackageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class CreateBoostPurchaseView(APIView):
    """
    Create a BoostPurchase record and charge via wallet or record external reference.
    POST payload:
    {
      listing_id: "<uuid>",
      package_id: 1,
      method: "wallet"|"external",
      reference: "PAYSTACK_REF" (if external)
    }
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = BoostPurchaseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        listing = serializer.validated_data["listing_obj"]
        pkg = serializer.validated_data["package_obj"]
        method = serializer.validated_data["method"]
        reference = serializer.validated_data.get("reference")

        # Create purchase record
        purchase = BoostPurchase.objects.create(
            listing=listing,
            buyer=request.user,
            package=pkg,
            amount=pkg.price,
            reference=reference,
            status="pending",
        )

        # If wallet purchase -> try to debit user's wallet immediately
        if method == "wallet":
            wallet = Wallet.objects.filter(user=request.user, is_active=True).first()
            if not wallet:
                purchase.status = "failed"
                purchase.save(update_fields=["status"])
                return Response({"detail": "No active wallet found"}, status=status.HTTP_400_BAD_REQUEST)

            if wallet.balance < pkg.price:
                purchase.status = "failed"
                purchase.save(update_fields=["status"])
                return Response({"detail": "Insufficient wallet balance"}, status=status.HTTP_400_BAD_REQUEST)

            # Deduct
            wallet.balance = wallet.balance - pkg.price
            wallet.save(update_fields=["balance"])
            WalletTransaction.objects.create(
                wallet=wallet,
                txn_type="debit",
                amount=pkg.price,
                reference=f"BOOST:{purchase.uid}",
                description=f"Boost purchase for listing {listing.id}",
                status="success",
            )
            # Activate purchase
            purchase.activate(at=timezone.now())

            # Update listing optimization boost_score and ranking by putting a boost score
            # We'll set a boost_score field on SearchOptimization (exists)
            opt = getattr(listing, "optimization", None)
            if opt:
                opt.boost_score = max(opt.boost_score, 50)  # Admin controlled logic; 50 is example
                opt.save(update_fields=["boost_score", "updated_at"])

            return Response(BoostPurchaseSerializer(purchase).data, status=status.HTTP_201_CREATED)

        # If external method: leave as pending until webhook/verify confirms, return purchase id
        return Response({"purchase": BoostPurchaseSerializer(purchase).data}, status=status.HTTP_201_CREATED)


class ConfirmExternalBoostView(APIView):
    """
    Called by external webhook or by admin after verifying the external payment.
    Expects: purchase_uid, reference (gateway), amount (optional)
    This endpoint must be protected / idempotent in production (only gateway/webhook or admin).
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        uid = request.data.get("purchase_uid")
        reference = request.data.get("reference")
        try:
            purchase = BoostPurchase.objects.get(uid=uid)
        except BoostPurchase.DoesNotExist:
            return Response({"detail": "Purchase not found"}, status=status.HTTP_404_NOT_FOUND)

        if purchase.status == "success":
            return Response({"detail": "Already processed"}, status=status.HTTP_200_OK)

        # mark success and activate
        purchase.reference = reference
        purchase.activate(at=timezone.now())

        # update boost score
        opt = getattr(purchase.listing, "optimization", None)
        if opt:
            opt.boost_score = max(opt.boost_score, 50)
            opt.save(update_fields=["boost_score", "updated_at"])

        return Response(BoostPurchaseSerializer(purchase).data, status=status.HTTP_200_OK)
