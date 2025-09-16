from django.db import transaction
from .models import UIDSequence, User
from django.conf import settings

def _next_seq(entity_type, state_code="00", lga_code="00"):
    with transaction.atomic():
        obj, created = UIDSequence.objects.select_for_update().get_or_create(
            entity_type=entity_type, state_code=state_code, lga_code=lga_code,
            defaults={"seq": 0},
        )
        obj.seq += 1
        obj.save()
        return obj.seq

def generate_tenant_uid(state_code="01", lga_code="01"):
    # Format: TNT/01/01/00001 (padding configurable)
    padding = getattr(settings, "UID_TENANT_PADDING", 5)
    seq = _next_seq("tenant", state_code, lga_code)
    return f"TNT/{state_code}/{lga_code}/{str(seq).zfill(padding)}"

def assign_uid_to_user(user: User, entity_type="tenant", state_code="01", lga_code="01"):
    if user.uid:
        return user.uid
    if entity_type == "tenant":
        uid = generate_tenant_uid(state_code, lga_code)
    else:
        # Fallback simple uid
        seq = _next_seq(entity_type, state_code, lga_code)
        uid = f"{entity_type.upper()}/{state_code}/{lga_code}/{str(seq).zfill(4)}"
    user.uid = uid
    user.save(update_fields=["uid"])
    return uid
