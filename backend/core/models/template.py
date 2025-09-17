from django.db import models

class Template(models.Model):
    # TODO: add fields like name, content, type (email, sms, pdf), etc.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "templates"

    def __str__(self):
        return f"Template {self.id}"
