# backend/disputes/apps.py
from django.apps import AppConfig

class DisputesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "disputes"

    def ready(self):
        # Ensure signal handlers are registered
        import disputes.signals  # noqa
