from django.shortcuts import get_object_or_404
from rest_framework import serializers

from catalog.models import Company, RatingCategory, ReviewSource, Standard
from reviews.models import CompanyClaim, IngestionJob, Notification, Review, ReviewCategoryRating, ReviewReport


class ReviewSerializer(serializers.ModelSerializer):
    review_id = serializers.UUIDField(source="id", read_only=True)
    provider_id = serializers.CharField(source="company.slug", read_only=True)
    standard_id = serializers.SerializerMethodField()
    rating = serializers.FloatField()
    category_ratings = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "review_id",
            "provider_id",
            "standard_id",
            "reviewer_type",
            "reviewer_name",
            "rating",
            "review_title",
            "review_text",
            "verification_status",
            "moderation_status",
            "review_tags",
            "programme_studied",
            "employer_type",
            "would_recommend",
            "response_text",
            "response_by",
            "response_role",
            "response_date",
            "review_date",
            "helpful_count",
            "category_ratings",
        ]

    def get_standard_id(self, obj):
        return obj.standard.standard_id if obj.standard_id else ""

    def get_category_ratings(self, obj):
        return {r.category_id: float(r.rating) for r in obj.category_ratings.all()}


class ProviderResponseSerializer(serializers.ModelSerializer):
    review_id = serializers.UUIDField(source="id", read_only=True)
    provider_id = serializers.CharField(source="company.slug", read_only=True)
    responder = serializers.CharField(source="response_by")
    role = serializers.CharField(source="response_role")
    date = serializers.DateField(source="response_date")
    text = serializers.CharField(source="response_text")

    class Meta:
        model = Review
        fields = ["review_id", "provider_id", "responder", "role", "date", "text"]


class RespondToReviewSerializer(serializers.Serializer):
    text = serializers.CharField()
    responder = serializers.CharField()
    role = serializers.CharField()

    def save(self, review):
        from django.utils import timezone

        review.response_text = self.validated_data["text"]
        review.response_by = self.validated_data["responder"]
        review.response_role = self.validated_data["role"]
        review.response_date = timezone.now().date()
        review.save(update_fields=["response_text", "response_by", "response_role", "response_date", "updated_at"])
        return review


class ModerateReviewSerializer(serializers.Serializer):
    moderation_status = serializers.ChoiceField(choices=Review.ModerationStatus.choices)

    def save(self, review):
        review.moderation_status = self.validated_data["moderation_status"]
        review.save(update_fields=["moderation_status", "updated_at"])
        return review


class ReviewCreateSerializer(serializers.Serializer):
    company_slug = serializers.SlugField()
    standard_slug = serializers.SlugField(required=False, allow_null=True)
    reviewer_type = serializers.ChoiceField(choices=Review.ReviewerType.choices)
    rating = serializers.FloatField(min_value=1, max_value=5)
    review_title = serializers.CharField(max_length=255)
    review_text = serializers.CharField()
    review_tags = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    programme_studied = serializers.CharField(required=False, allow_blank=True, default="")
    employer_type = serializers.CharField(required=False, allow_blank=True, default="")
    would_recommend = serializers.BooleanField(required=False, allow_null=True, default=None)
    completion_status = serializers.ChoiceField(
        choices=Review.CompletionStatus.choices, required=False, allow_null=True, default=None
    )
    category_ratings = serializers.DictField(child=serializers.FloatField(), required=False, default=dict)

    def create(self, validated_data):
        import hashlib

        from django.utils import timezone

        company = get_object_or_404(Company, slug=validated_data["company_slug"])
        standard = None
        if validated_data.get("standard_slug"):
            standard = get_object_or_404(Standard, standard_id=validated_data["standard_slug"])
        native_source, _ = ReviewSource.objects.get_or_create(
            source_key="native", defaults={"display_name": "Native submission"}
        )
        category_ratings = validated_data.pop("category_ratings", {})
        request = self.context["request"]
        fingerprint = hashlib.sha256(
            f"{company.id}|{request.user.id}|{validated_data['review_title']}|{validated_data['review_text']}".encode()
        ).hexdigest()

        review = Review.objects.create(
            company=company,
            standard=standard,
            source=native_source,
            reviewer_user=request.user,
            reviewer_type=validated_data["reviewer_type"],
            rating=validated_data["rating"],
            review_title=validated_data["review_title"],
            review_text=validated_data["review_text"],
            review_tags=validated_data.get("review_tags") or [],
            programme_studied=validated_data.get("programme_studied") or "",
            employer_type=validated_data.get("employer_type") or "",
            would_recommend=validated_data.get("would_recommend"),
            completion_status=validated_data.get("completion_status") or None,
            review_date=timezone.now().date(),
            content_fingerprint=fingerprint,
        )
        for key, value in category_ratings.items():
            if RatingCategory.objects.filter(key=key).exists():
                ReviewCategoryRating.objects.create(review=review, category_id=key, rating=value)
        return review


class CompanyClaimSerializer(serializers.ModelSerializer):
    company_slug = serializers.SlugRelatedField(
        source="company", slug_field="slug", queryset=Company.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = CompanyClaim
        fields = [
            "id",
            "company_slug",
            "organisation_name",
            "contact_name",
            "email",
            "role",
            "website",
            "verification_details",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]


class ReviewReportSerializer(serializers.ModelSerializer):
    review_id = serializers.UUIDField(source="review.id")

    class Meta:
        model = ReviewReport
        fields = ["id", "review_id", "reason", "details", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]

    def create(self, validated_data):
        review_ref = validated_data.pop("review")
        review = get_object_or_404(Review, id=review_ref["id"])
        return ReviewReport.objects.create(review=review, **validated_data)


class IngestionJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = IngestionJob
        fields = "__all__"


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "notification_type", "title", "message", "link", "is_read", "created_at"]
        read_only_fields = fields
