from django.db.models.signals import post_save
from django.dispatch import receiver
from .models.listings import PropertyListing, SearchOptimization


@receiver(post_save, sender=PropertyListing)
def create_optimization_record(sender, instance, created, **kwargs):
    if created and not hasattr(instance, "optimization"):
        SearchOptimization.objects.create(listing=instance)
