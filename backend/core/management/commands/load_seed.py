import os
from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = "Load initial seed data from seed_data.json"

    def handle(self, *args, **kwargs):
        seed_file = os.path.join("backend", "seed_data.json")
        if os.path.exists(seed_file):
            self.stdout.write(self.style.WARNING("Seeding database from seed_data.json..."))
            call_command("loaddata", seed_file)
            self.stdout.write(self.style.SUCCESS("Seed data loaded successfully."))
        else:
            self.stdout.write(self.style.ERROR(f"Seed file not found: {seed_file}"))
