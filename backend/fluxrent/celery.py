# backend/fluxrent/celery.py
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fluxrent.settings")

from django.conf import settings  # noqa: E402

app = Celery("fluxrent")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

# optional: simple periodic schedule (can be extended)
app.conf.beat_schedule = {
    # example: run every day to reconcile accounts (placeholder)
    # "daily-reconcile": {"task": "bills.tasks.daily_reconcile", "schedule": 86400},
}
