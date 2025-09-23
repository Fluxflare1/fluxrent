from rest_framework.routers import DefaultRouter
from .views import WalletViewSet, WalletTransactionViewSet, WalletSecurityViewSet
from .views import StandingOrderViewSet

router = DefaultRouter()
router.register(r"wallets", WalletViewSet, basename="wallet")
router.register(r"transactions", WalletTransactionViewSet, basename="wallet-txn")
router.register(r"security", WalletSecurityViewSet, basename="wallet-security")
router.register(r"standing-orders", StandingOrderViewSet, basename="standing-order")


urlpatterns = router.urls






