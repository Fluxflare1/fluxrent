from django.db import models

class Property(models.Model):
    # Placeholder fields
    # TODO: add fields like name, address, owner, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "properties"

    def __str__(self):
        return f"Property {self.id}"
