# backend/users/management/commands/seed_users.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = "Seed initial users: admin, manager, tenant"

    def handle(self, *args, **options):
        created = []
        # Admin
        admin_email = "admin@system.com"
        if not User.objects.filter(email=admin_email).exists():
            admin = User.objects.create_superuser(email=admin_email, password="admin123")
            admin.first_name = "System"
            admin.last_name = "Admin"
            admin.role = "super_admin"
            admin.is_active = True
            admin.save()
            created.append(admin_email)

        # Manager
        manager_email = "manager@system.com"
        if not User.objects.filter(email=manager_email).exists():
            m = User.objects.create_user(email=manager_email, password="manager123", first_name="Platform", last_name="Manager")
            m.role = "property_manager"
            m.is_active = True
            m.save()
            created.append(manager_email)

        # Tenant
        tenant_email = "tenant@system.com"
        if not User.objects.filter(email=tenant_email).exists():
            t = User.objects.create_user(email=tenant_email, password="tenant123", first_name="John", last_name="Tenant")
            t.role = "tenant"
            t.is_active = True
            t.save()
            created.append(tenant_email)

        self.stdout.write(self.style.SUCCESS(f"Seed complete. Created: {', '.join(created) if created else 'none (already exist)'}"))
