from django.db.models import Value, IntegerField, ExpressionWrapper, F
from django.utils import timezone

class PropertyListingViewSet(viewsets.ModelViewSet):
    queryset = PropertyListing.objects.all()
    serializer_class = PropertyListingSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        now = timezone.now()
        qs = qs.annotate(
            boost_active=ExpressionWrapper(
                models.Case(
                    models.When(boost_until__gt=now, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField(),
                ),
                output_field=IntegerField()
            ),
            age_days=ExpressionWrapper(
                (now - F("posted_at")).days,
                output_field=IntegerField()
            ),
        ).annotate(
            ranking_score=F("boost_active") * 1000 + (100 - F("age_days"))
        ).order_by("-ranking_score", "-posted_at")

        return qs
