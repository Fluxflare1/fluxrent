from django.db import models

class Utility(models.Model):
    # TODO: add fields like type (water, electricity), billing_cycle, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "utilities"

    def __str__(self):
        return f"Utility {self.id}"
