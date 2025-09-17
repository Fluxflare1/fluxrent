from django.db import models

class Apartment(models.Model):
    # TODO: add fields like property (FK), unit_number, floor, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "apartments"

    def __str__(self):
        return f"Apartment {self.id}"
