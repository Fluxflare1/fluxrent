# backend/wallet/services/paystack.py
"""
Small Paystack client for required operations:
- create_customer
- create_dedicated_account (DVA)
- verify_transaction (optional)
This is lightweight and designed for synchronous calls with basic error handling.
"""

import hmac
import hashlib
import json
from typing import Optional, Dict, Any
import requests
from django.conf import settings

PAYSTACK_SECRET_KEY = getattr(settings, "PAYSTACK_SECRET_KEY", None)
PAYSTACK_BASE = "https://api.paystack.co"


class PaystackError(Exception):
    pass


def _headers():
    if not PAYSTACK_SECRET_KEY:
        raise PaystackError("PAYSTACK_SECRET_KEY not set in settings")
    return {
        "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }


def create_customer(email: str, first_name: Optional[str] = None, last_name: Optional[str] = None, phone: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a Paystack customer. Returns the API response data (raises PaystackError on failure).
    """
    url = f"{PAYSTACK_BASE}/customer"
    payload = {"email": email}
    if first_name:
        payload["first_name"] = first_name
    if last_name:
        payload["last_name"] = last_name
    if phone:
        payload["phone"] = phone

    resp = requests.post(url, headers=_headers(), json=payload, timeout=20)
    if resp.status_code not in (200, 201):
        raise PaystackError(f"create_customer failed: {resp.status_code} {resp.text}")
    body = resp.json()
    if not body.get("status"):
        raise PaystackError(f"create_customer error: {body}")
    return body["data"]


def create_dedicated_account(customer: str, preferred_bank: Optional[str] = None, metadata: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Create/assign a dedicated virtual account to a Paystack customer.
    customer: Paystack customer code or id (e.g., "CUS_xxx")
    preferred_bank: optional slug like "test-bank" or "titan-paystack"
    """
    url = f"{PAYSTACK_BASE}/dedicated_account"
    payload = {"customer": customer}
    if preferred_bank:
        payload["preferred_bank"] = preferred_bank
    if metadata:
        payload["metadata"] = metadata

    resp = requests.post(url, headers=_headers(), json=payload, timeout=20)
    if resp.status_code not in (200, 201):
        raise PaystackError(f"create_dedicated_account failed: {resp.status_code} {resp.text}")
    body = resp.json()
    if not body.get("status"):
        raise PaystackError(f"create_dedicated_account error: {body}")
    return body["data"]


def verify_transaction(reference: str) -> Dict[str, Any]:
    """
    Verify a transaction by reference.
    """
    url = f"{PAYSTACK_BASE}/transaction/verify/{reference}"
    resp = requests.get(url, headers=_headers(), timeout=20)
    if resp.status_code != 200:
        raise PaystackError(f"verify_transaction failed: {resp.status_code} {resp.text}")
    body = resp.json()
    if not body.get("status"):
        raise PaystackError(f"verify_transaction error: {body}")
    return body["data"]


def verify_webhook_signature(payload_body: bytes, header_signature: str) -> bool:
    """
    Paystack uses HMAC-SHA512 with your secret key.
    Header name x-paystack-signature (lowercase) is used in docs.
    """
    if not PAYSTACK_SECRET_KEY:
        return False
    computed = hmac.new(PAYSTACK_SECRET_KEY.encode(), payload_body, hashlib.sha512).hexdigest()
    # header may be provided without hex normalization; compare safely
    return hmac.compare_digest(computed, header_signature)
