from django.urls import path
from .views import (
    WalletDetailView,
    WalletTransactionsView,
    WalletFundView,
    WalletTransferView,
    SavingsPlanCreateView,
    SavingsPlanDepositView,
    SavingsPlanWithdrawView,
)
from .webhook import PaystackWebhookView

urlpatterns = [
    path("wallet/", WalletDetailView.as_view(), name="wallet-detail"),
    path("wallet/transactions/", WalletTransactionsView.as_view(), name="wallet-transactions"),
    path("wallet/fund/", WalletFundView.as_view(), name="wallet-fund"),
    path("wallet/transfer/", WalletTransferView.as_view(), name="wallet-transfer"),
    path("wallet/plans/", SavingsPlanCreateView.as_view(), name="savings-plan-create"),
    path("wallet/plans/<uuid:pk>/deposit/", SavingsPlanDepositView.as_view(), name="savings-plan-deposit"),
    path("wallet/plans/<uuid:pk>/withdraw/", SavingsPlanWithdrawView.as_view(), name="savings-plan-withdraw"),
    path("wallets/webhook/paystack/", PaystackWebhookView.as_view(), name="paystack-webhook"),
]
