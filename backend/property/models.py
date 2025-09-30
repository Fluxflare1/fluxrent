from django.db import models
from django.utils import timezone
from datetime import timedelta


class PropertyListing(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    location = models.CharField(max_length=255)
    
    is_paid = models.BooleanField(default=False)
    boost_until = models.DateTimeField(null=True, blank=True)
    posted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def is_boosted(self):
        return self.boost_until and self.boost_until > timezone.now()

    def is_expired(self):
        return self.expires_at and self.expires_at < timezone.now()

    def mark_as_boosted(self, days: int):
        now = timezone.now()
        self.boost_until = max(self.boost_until or now, now) + timedelta(days=days)
        self.is_paid = True
        self.save()

    def ranking_score(self):
        """
        Higher score means higher rank in search.
        Boosted > Fresh > Older
        """
        score = 0
        now = timezone.now()

        if self.boost_until and self.boost_until > now:
            score += 1000

        age_days = (now - self.posted_at).days
        score += max(0, 100 - age_days)

        return score
