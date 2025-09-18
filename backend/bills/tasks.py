# backend/bills/tasks.py
from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, default_retry_delay=60, max_retries=3)
def send_invoice_email(self, invoice_id: int):
    """
    Example background task: send invoice email (stub).
    Replace with real send logic using Django email or an async email API.
    """
    try:
        # placeholder logic
        logger.info("send_invoice_email called for invoice_id=%s", invoice_id)
        # TODO: fetch invoice, render template, send email
        return {"status": "ok", "invoice_id": invoice_id}
    except Exception as exc:
        logger.exception("Failed send_invoice_email")
        raise self.retry(exc=exc)
