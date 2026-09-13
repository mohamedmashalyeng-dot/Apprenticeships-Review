from rest_framework import serializers

from catalog.models import Category, Company, RatingCategory, ReviewSource, SavedProvider, Standard, StandardFAQ


class CompanySerializer(serializers.ModelSerializer):
    provider_id = serializers.CharField(source="slug")
    UKPRN = serializers.CharField(source="ukprn", required=False, allow_blank=True)
    Ofsted_status = serializers.CharField(source="ofsted_status", required=False, allow_blank=True)
    logoUrl = serializers.CharField(source="logo_url", required=False, allow_blank=True)
    average_rating = serializers.FloatField(read_only=True)
    category_names = serializers.SerializerMethodField()
    levels = serializers.SerializerMethodField()
    recommendation_percent = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            "provider_id",
            "trading_name",
            "legal_name",
            "UKPRN",
            "website",
            "location",
            "Ofsted_status",
            "verification_status",
            "data_last_updated",
            "delivery_model",
            "description",
            "strengths",
            "weaknesses",
            "best_for",
            "logoUrl",
            "average_rating",
            "total_reviews",
            "category_names",
            "levels",
            "recommendation_percent",
        ]
        # A company owner can PATCH their own listing (see CompanyViewSet.check_object_permissions),
        # but must not be able to self-assign verification, review stats, or their own slug/URL.
        read_only_fields = ["provider_id", "verification_status", "total_reviews", "data_last_updated"]

    def get_category_names(self, obj):
        # Relies on the view's `ArrayAgg("standards__categories__name", ...)` annotation.
        return sorted(getattr(obj, "_category_names", None) or [])

    def get_levels(self, obj):
        # Relies on the view's `ArrayAgg("standards__level", ...)` annotation.
        return sorted(getattr(obj, "_levels", None) or [])

    def get_recommendation_percent(self, obj):
        # Relies on the view's `.annotate(_recommend_yes=..., _recommend_total=...)`.
        total = getattr(obj, "_recommend_total", 0)
        if not total:
            return None
        return round(100 * getattr(obj, "_recommend_yes", 0) / total)


class StandardFAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = StandardFAQ
        fields = ["question", "answer"]


class StandardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Standard
        fields = [
            "standard_id",
            "standard_name",
            "level",
            "sector",
            "description",
            "who_for",
            "typical_learner",
            "typical_employer",
            "duration",
            "max_funding",
            "has_landing_page",
        ]


class CategorySerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="category_id")
    standard_ids = serializers.SlugRelatedField(
        source="standards", slug_field="standard_id", many=True, read_only=True
    )

    class Meta:
        model = Category
        fields = ["id", "name", "icon", "description", "standard_ids", "accent"]


class RatingCategorySerializer(serializers.ModelSerializer):
    shortLabel = serializers.CharField(source="short_label")

    class Meta:
        model = RatingCategory
        fields = ["key", "label", "shortLabel", "icon", "description"]


class ReviewSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewSource
        fields = ["source_key", "display_name", "website_url", "is_external_api"]


class ProviderStandardLinkSerializer(serializers.Serializer):
    provider_id = serializers.CharField()
    standard_id = serializers.CharField()
    delivery_status = serializers.CharField()
    evidence_source = serializers.CharField(allow_blank=True)


class SavedProviderSerializer(serializers.ModelSerializer):
    provider_id = serializers.CharField(source="company.slug", read_only=True)

    class Meta:
        model = SavedProvider
        fields = ["provider_id", "created_at"]
