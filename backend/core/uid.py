# backend/core/uid.py
import datetime
import random
import string

def _seq(n=5):
    return str(random.randint(0, 10**n-1)).zfill(n)

def gen_user_uid(prefix="TNT", state_code="00", lga_code="00", seq=None):
    """
    Example format: TNT/01/08/00045
    Caller should provide state_code & lga_code where available.
    """
    if seq is None:
        seq = _seq(5)
    return f"{prefix}/{state_code}/{lga_code}/{seq}"

def gen_property_uid(state_code="00", lga_code="00", street_code="00", house_seq=None):
    """
    Example: NGN[STATE]/[LGA]/[STREET]/[HOUSE]
    """
    if house_seq is None:
        house_seq = _seq(4)
    return f"NGN{state_code}/{lga_code}/{street_code}/{house_seq}"
