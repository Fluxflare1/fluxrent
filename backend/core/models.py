class PlatformSettings(models.Model):
    free_post_days = models.PositiveIntegerField(default=14)
    min_boost_days = models.PositiveIntegerField(default=7)
    boost_daily_rate = models.DecimalField(max_digits=8, decimal_places=2, default=500.00)  # NGN 500/day

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Platform Settings"
