# backend/users/management/commands/load_seed.py
import json
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings
from pathlib import Path

User = get_user_model()

class Command(BaseCommand):
    help = "Load seed data from seed_data.json (idempotent)"

    def handle(self, *args, **options):
        base = Path(settings.BASE_DIR) if hasattr(settings, "BASE_DIR") else Path(__file__).resolve().parents[4]
        seed_file = base / "seed_data.json"
        if not seed_file.exists():
            self.stdout.write(self.style.WARNING(f"No seed_data.json at {seed_file}"))
            return

        data = json.loads(seed_file.read_text(encoding="utf-8"))
        users = data.get("users", [])
        for u in users:
            email = u.get("email")
            username = u.get("username") or email.split("@")[0]
            user, created = User.objects.get_or_create(email=email, defaults={
                "username": username,
                "first_name": u.get("first_name", ""),
                "last_name": u.get("last_name", ""),
                "role": u.get("role", "tenant"),
                "is_staff": u.get("is_staff", False),
                "is_superuser": u.get("is_superuser", False),
            })
            if created:
                user.set_password(u.get("password", "changeme123"))
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created user: {email} -> role {user.role}"))
            else:
                self.stdout.write(self.style.NOTICE(f"User exists: {email}"))

        self.stdout.write(self.style.SUCCESS("Seed loading complete."))
