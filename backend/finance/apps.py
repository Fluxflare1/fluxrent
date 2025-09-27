# backend/finance/apps.py
from django.apps import AppConfig


class FinanceConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "finance"

    def ready(self):
        # import signals to wire to existing wallet/payment models
        import finance.signals  # noqa: F401
