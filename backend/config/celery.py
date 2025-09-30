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



# backend/config/celery.py (merge into existing beat_schedule)
app.conf.beat_schedule = getattr(app.conf, "beat_schedule", {})
app.conf.beat_schedule.update({
    "process-standing-orders-daily": {
        "task": "wallet.tasks.process_standing_orders",
        "schedule": crontab(hour=0, minute=0),
    },
    "rents-apply-late-fees-daily": {
        "task": "rents.tasks.apply_late_fees",
        "schedule": crontab(hour=1, minute=0),  # 1am daily
    },
})




# backend/config/celery.py (add to app.conf.beat_schedule)
app.conf.beat_schedule.update({
    "properties-recalc-ranking-daily": {
        "task": "properties.tasks.recalc_all_listing_rankings",
        "schedule": crontab(hour=2, minute=0),  # example: 2am daily
    },
    "properties-expire-free-posts-daily": {
        "task": "properties.tasks.expire_free_posts",
        "schedule": crontab(hour=3, minute=0),
    },
})
