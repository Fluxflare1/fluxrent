class PropertyListingSerializer(serializers.ModelSerializer):
    ranking_score = serializers.IntegerField(read_only=True)

    class Meta:
        model = PropertyListing
        fields = "__all__"
