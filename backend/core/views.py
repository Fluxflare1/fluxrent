from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.utils import timezone
from datetime import timedelta

from .models import PropertyListing
from core.models import PlatformSettings
from wallet.models import WalletTransaction, Wallet

class PropertyListingViewSet(viewsets.ModelViewSet):
    queryset = PropertyListing.objects.all()
    serializer_class = PropertyListingSerializer

    @action(detail=True, methods=["post"])
    def boost(self, request, pk=None):
        """
        Boost a property listing via wallet or paystack
        """
        listing = self.get_object()
        settings = PlatformSettings.objects.first()
        days = int(request.data.get("days", settings.min_boost_days))
        cost = settings.boost_daily_rate * days

        wallet = Wallet.objects.get(user=request.user)

        if wallet.balance < cost:
            return Response({"detail": "Insufficient wallet balance"}, status=status.HTTP_400_BAD_REQUEST)

        # Deduct balance
        WalletTransaction.objects.create(
            wallet=wallet,
            amount=cost,
            type="debit",
            description=f"Boost listing {listing.id} for {days} days",
            reference=f"boost-{listing.id}-{timezone.now().timestamp()}",
            status="success",
        )
        wallet.balance -= cost
        wallet.save()

        listing.mark_as_boosted(days)

        return Response({"detail": f"Listing boosted for {days} days", "boost_until": listing.boost_until})
