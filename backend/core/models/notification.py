from django.db import models

class Notification(models.Model):
    # TODO: add fields like recipient (FK to User), message, status, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "notifications"

    def __str__(self):
        return f"Notification {self.id}"
