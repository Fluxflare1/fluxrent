from wallets.models import Wallet
from django.db import transaction

class KYCVerificationView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        user = request.user
        serializer = KYCSubmissionSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        kyc = serializer.save(user=user, status="pending")

        # ✅ Wallet auto-create after KYC success
        if not Wallet.objects.filter(owner=user).exists():
            Wallet.objects.create(owner=user, balance=0)

        return Response({"detail": "KYC submitted successfully, wallet created"}, status=201)
