import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
app = Celery("config")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "process-standing-orders-daily": {
        "task": "wallet.tasks.process_standing_orders",
        "schedule": crontab(hour=0, minute=0),  # midnight daily
    },
    "process-auto-refunds-daily": {
        "task": "wallet.tasks.refund_tasks.process_auto_refunds",
        "schedule": crontab(hour=3, minute=0),  # runs daily at 3 AM
    },
}
