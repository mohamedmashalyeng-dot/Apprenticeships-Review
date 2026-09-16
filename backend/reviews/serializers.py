from django.shortcuts import get_object_or_404
from rest_framework import serializers

from catalog.models import Company, RatingCategory, ReviewSource, Standard
from reviews.models import CompanyClaim, IngestionJob, Notification, Review, ReviewCategoryRating, ReviewReport


class ReviewSerializer(serializers.ModelSerializer):
    review_id = serializers.UUIDField(source="id", read_only=True)
    provider_id = serializers.SerializerMethodField()
    pending_provider_name = serializers.SerializerMethodField()
    standard_id = serializers.SerializerMethodField()
    rating = serializers.FloatField()
    category_ratings = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "review_id",
            "provider_id",
            "pending_provider_name",
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

    def get_provider_id(self, obj):
        return obj.company.slug if obj.company_id else None

    def get_pending_provider_name(self, obj):
        return obj.pending_claim.organisation_name if obj.pending_claim_id else None

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
    # Exactly one of these two identifies who the review is about: an existing provider, or a
    # provider that's just been requested via a CompanyClaim and doesn't exist yet.
    company_slug = serializers.SlugField(required=False, allow_null=True)
    pending_claim_id = serializers.UUIDField(required=False, allow_null=True)
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

    def validate(self, attrs):
        if not attrs.get("company_slug") and not attrs.get("pending_claim_id"):
            raise serializers.ValidationError("Either company_slug or pending_claim_id is required.")
        return attrs

    def create(self, validated_data):
        import hashlib

        from django.utils import timezone

        request = self.context["request"]
        company = None
        pending_claim = None
        identity_key = ""

        if validated_data.get("company_slug"):
            company = get_object_or_404(Company, slug=validated_data["company_slug"])
            identity_key = str(company.id)
        else:
            pending_claim = get_object_or_404(
                CompanyClaim, id=validated_data["pending_claim_id"], submitted_by=request.user, status=CompanyClaim.Status.PENDING
            )
            identity_key = f"claim:{pending_claim.id}"

        standard = None
        if validated_data.get("standard_slug"):
            standard = get_object_or_404(Standard, standard_id=validated_data["standard_slug"])
        native_source, _ = ReviewSource.objects.get_or_create(
            source_key="native", defaults={"display_name": "Native submission"}
        )
        category_ratings = validated_data.pop("category_ratings", {})
        fingerprint = hashlib.sha256(
            f"{identity_key}|{request.user.id}|{validated_data['review_title']}|{validated_data['review_text']}".encode()
        ).hexdigest()

        review = Review.objects.create(
            company=company,
            pending_claim=pending_claim,
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


class ReviewUpdateSerializer(serializers.Serializer):
    """Powers PATCH/PUT /reviews/{id}/ — deliberately exposes only the content fields an
    author (or moderator) may legitimately change. Unlike ReviewSerializer (used for reads),
    this never accepts moderation_status, verification_status, or provider-response fields —
    those go through the dedicated moderate/respond actions instead."""

    rating = serializers.FloatField(min_value=1, max_value=5)
    review_title = serializers.CharField(max_length=255)
    review_text = serializers.CharField()
    review_tags = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    would_recommend = serializers.BooleanField(required=False, allow_null=True, default=None)
    completion_status = serializers.ChoiceField(
        choices=Review.CompletionStatus.choices, required=False, allow_null=True, default=None
    )
    category_ratings = serializers.DictField(child=serializers.FloatField(), required=False)

    def update(self, instance, validated_data):
        for field in ("rating", "review_title", "review_text", "review_tags", "would_recommend", "completion_status"):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()

        if "category_ratings" in validated_data:
            instance.category_ratings.all().delete()
            for key, value in validated_data["category_ratings"].items():
                if RatingCategory.objects.filter(key=key).exists():
                    ReviewCategoryRating.objects.create(review=instance, category_id=key, rating=value)
        return instance


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
