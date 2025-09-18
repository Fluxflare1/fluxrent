# backend/users/utils_uid.py
import time
import secrets
from django.utils.crypto import get_random_string

# Generate a user UID of form: TNT/<STATE>/<LGA>/<SEQ>
# Example: TNT/01/08/000045
def generate_user_uid(state_code: str = "01", lga_code: str = "01") -> str:
    # seq from timestamp + random short suffix to reduce collision chance
    seq = int(time.time() * 1000) % 1000000  # keep it reasonable
    seq_str = str(seq).zfill(6)
    random_tail = get_random_string(4, allowed_chars="0123456789")
    uid = f"TNT/{state_code}/{lga_code}/{seq_str}{random_tail}"
    return uid
