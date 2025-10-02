from .models import AuditLog

def log_admin_action(user, action, object_repr=None, data=None, ip_address=None):
    """
    Helper to create an audit log entry.
    Keep this lightweight and call from views after important actions.
    """
    AuditLog.objects.create(
        actor=user if getattr(user, "is_authenticated", False) else None,
        action=action,
        object_repr=object_repr or "",
        data=data or {},
        ip_address=ip_address or ""
    )
