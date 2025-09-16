from django.core.management.base import BaseCommand
from users.models import User
import os

class Command(BaseCommand):
    help = "Seed initial users (admin, property_admin, tenant, agent)"

    def handle(self, *args, **options):
        admin_email = os.environ.get("SEED_ADMIN_EMAIL", "admin@system.com")
        admin_pass = os.environ.get("SEED_ADMIN_PASS", "admin123")
        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_superuser(email=admin_email, password=admin_pass, first_name="Platform", last_name="Admin", role="admin", status="approved", is_staff=True)
            self.stdout.write(self.style.SUCCESS(f"Created admin user: {admin_email} / {admin_pass}"))
        else:
            self.stdout.write(self.style.WARNING(f"Admin user already exists: {admin_email}"))

        # property_admin
        pm_email = os.environ.get("SEED_PM_EMAIL", "pm@system.com")
        pm_pass = os.environ.get("SEED_PM_PASS", "pm123")
        if not User.objects.filter(email=pm_email).exists():
            u = User.objects.create_user(email=pm_email, password=pm_pass, first_name="Property", last_name="Manager", role="property_admin", status="approved")
            self.stdout.write(self.style.SUCCESS(f"Created property_admin: {pm_email} / {pm_pass}"))
        else:
            self.stdout.write(self.style.WARNING(f"property_admin already exists: {pm_email}"))

        # agent
        ag_email = os.environ.get("SEED_AGENT_EMAIL", "agent@system.com")
        ag_pass = os.environ.get("SEED_AGENT_PASS", "agent123")
        if not User.objects.filter(email=ag_email).exists():
            User.objects.create_user(email=ag_email, password=ag_pass, first_name="Listing", last_name="Agent", role="agent", status="approved")
            self.stdout.write(self.style.SUCCESS(f"Created agent: {ag_email} / {ag_pass}"))
        else:
            self.stdout.write(self.style.WARNING(f"agent already exists: {ag_email}"))

        # tenant
        t_email = os.environ.get("SEED_TENANT_EMAIL", "tenant@system.com")
        t_pass = os.environ.get("SEED_TENANT_PASS", "tenant123")
        if not User.objects.filter(email=t_email).exists():
            User.objects.create_user(email=t_email, password=t_pass, first_name="Test", last_name="Tenant", role="tenant", status="approved")
            self.stdout.write(self.style.SUCCESS(f"Created tenant: {t_email} / {t_pass}"))
        else:
            self.stdout.write(self.style.WARNING(f"tenant already exists: {t_email}"))
