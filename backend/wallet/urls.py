# backend/wallet/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WalletViewSet, WalletTransactionViewSet, WalletSecurityViewSet
from .views import StandingOrderViewSet  # if present in your views
from .views_paystack import CreatePaystackCustomerView, CreateDedicatedAccountView, PaystackWebhookView
from wallet.views.refund import RefundViewSet

router = DefaultRouter()
router.register(r"wallets", WalletViewSet, basename="wallet")
router.register(r"transactions", WalletTransactionViewSet, basename="wallet-txn")
router.register(r"security", WalletSecurityViewSet, basename="wallet-security")
router.register(r"standing-orders", StandingOrderViewSet, basename="standing-order")
router.register(r"refunds", RefundViewSet, basename="refund")

urlpatterns = [
    path("", include(router.urls)),
    # Paystack endpoints
    path("paystack/customers/create/", CreatePaystackCustomerView.as_view(), name="paystack-create-customer"),
    path("paystack/dva/create/", CreateDedicatedAccountView.as_view(), name="paystack-create-dva"),
    path("paystack/webhook/", PaystackWebhookView.as_view(), name="paystack-webhook"),
]






# backend/wallet/urls.py
from rest_framework.routers import DefaultRouter
from .views import WalletViewSet, WalletTransactionViewSet, WalletSecurityViewSet
from .views import StandingOrderViewSet
from .views_paystack import CreatePaystackCustomerView, CreateDedicatedAccountView, PaystackWebhookView
from .views_dispute import DisputeViewSet

router = DefaultRouter()
router.register(r"wallets", WalletViewSet, basename="wallet")
router.register(r"transactions", WalletTransactionViewSet, basename="wallet-txn")
router.register(r"security", WalletSecurityViewSet, basename="wallet-security")
router.register(r"standing-orders", StandingOrderViewSet, basename="standing-order")
router.register(r"disputes", DisputeViewSet, basename="dispute")

urlpatterns = router.urls + [
    # Paystack endpoints (keep existing)
    # path("paystack/customers/create/", CreatePaystackCustomerView.as_view(), name="paystack-create-customer"),
    # path("paystack/dva/create/", CreateDedicatedAccountView.as_view(), name="paystack-create-dva"),
    # path("paystack/webhook/", PaystackWebhookView.as_view(), name="paystack-webhook"),
]
