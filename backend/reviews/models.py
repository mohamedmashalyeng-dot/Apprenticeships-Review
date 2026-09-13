import uuid

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models import Q

from catalog.models import Company, RatingCategory, ReviewSource, Standard


class IngestionJob(models.Model):
    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        RUNNING = "running", "Running"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source = models.ForeignKey(ReviewSource, on_delete=models.PROTECT)
    company = models.ForeignKey(Company, null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.QUEUED)
    triggered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    file_name = models.CharField(max_length=255, blank=True)
    reviews_found = models.IntegerField(default=0)
    reviews_added = models.IntegerField(default=0)
    reviews_updated = models.IntegerField(default=0)
    reviews_skipped = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Ingestion {self.id} ({self.status})"


class Review(models.Model):
    class ReviewerType(models.TextChoices):
        LEARNER = "learner", "Learner"
        EMPLOYER = "employer", "Employer"

    class CompletionStatus(models.TextChoices):
        CURRENTLY_ENROLLED = "currently-enrolled", "Currently enrolled"
        COMPLETED = "completed", "Completed"
        WITHDRAWN = "withdrawn", "Withdrawn"

    class VerificationStatus(models.TextChoices):
        PENDING = "Pending Verification", "Pending Verification"
        VERIFIED = "Verified", "Verified"
        REJECTED = "Rejected", "Rejected"

    class ModerationStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        FLAGGED = "flagged", "Flagged"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="reviews")
    standard = models.ForeignKey(Standard, null=True, blank=True, on_delete=models.SET_NULL)
    source = models.ForeignKey(ReviewSource, on_delete=models.PROTECT)
    reviewer_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="reviews"
    )
    reviewer_type = models.CharField(max_length=20, choices=ReviewerType.choices)
    reviewer_name = models.CharField(max_length=255, blank=True)
    reviewer_avatar = models.URLField(blank=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1)
    review_title = models.CharField(max_length=255)
    review_text = models.TextField()
    review_tags = ArrayField(models.TextField(), default=list, blank=True)
    programme_studied = models.CharField(max_length=255, blank=True)
    employer_type = models.CharField(max_length=255, blank=True)
    would_recommend = models.BooleanField(null=True, blank=True)
    completion_status = models.CharField(
        max_length=30, choices=CompletionStatus.choices, blank=True, null=True
    )
    review_date = models.DateField()
    verification_status = models.CharField(
        max_length=30, choices=VerificationStatus.choices, default=VerificationStatus.PENDING
    )
    moderation_status = models.CharField(
        max_length=20, choices=ModerationStatus.choices, default=ModerationStatus.PENDING
    )
    sentiment = models.CharField(max_length=50, blank=True)
    helpful_count = models.IntegerField(default=0)
    external_review_id = models.CharField(max_length=255, blank=True, null=True)
    source_url = models.URLField(blank=True)
    content_fingerprint = models.CharField(max_length=64)
    response_text = models.TextField(blank=True)
    response_by = models.CharField(max_length=255, blank=True)
    response_role = models.CharField(max_length=255, blank=True)
    response_date = models.DateField(null=True, blank=True)
    imported_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["source", "external_review_id"],
                condition=Q(external_review_id__isnull=False),
                name="unique_source_external_review",
            ),
            models.UniqueConstraint(
                fields=["source", "company", "content_fingerprint"],
                condition=Q(external_review_id__isnull=True),
                name="unique_source_company_fingerprint",
            ),
        ]

    def __str__(self) -> str:
        return self.review_title


class ReviewCategoryRating(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name="category_ratings")
    category = models.ForeignKey(RatingCategory, on_delete=models.CASCADE)
    rating = models.DecimalField(max_digits=2, decimal_places=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["review", "category"], name="unique_review_category_rating")
        ]

    def __str__(self) -> str:
        return f"{self.review_id} / {self.category_id}"


class CompanyClaim(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, null=True, blank=True, on_delete=models.SET_NULL)
    organisation_name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255)
    email = models.EmailField()
    role = models.CharField(max_length=255)
    website = models.URLField()
    verification_details = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="submitted_claims",
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_claims",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        return f"Claim on {self.organisation_name}"


class ReviewReport(models.Model):
    class Reason(models.TextChoices):
        FAKE = "fake", "Fake"
        OFFENSIVE = "offensive", "Offensive"
        PERSONAL = "personal", "Personal information"
        CONFLICT = "conflict", "Conflict of interest"
        SPAM = "spam", "Spam"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        RESOLVED = "resolved", "Resolved"
        DISMISSED = "dismissed", "Dismissed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name="reports")
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    reason = models.CharField(max_length=20, choices=Reason.choices)
    details = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Report on {self.review_id}"


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        REVIEW_APPROVED = "review_approved", "Review approved"
        REVIEW_REJECTED = "review_rejected", "Review rejected"
        REVIEW_RESPONSE = "review_response", "Provider responded"
        CLAIM_APPROVED = "claim_approved", "Claim approved"
        CLAIM_REJECTED = "claim_rejected", "Claim rejected"
        NEW_REVIEW_FOR_COMPANY = "new_review_for_company", "New review for your company"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    title = models.CharField(max_length=255)
    message = models.TextField(blank=True)
    # Relative frontend path the notification should link to when clicked, e.g. "/review/<id>".
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.notification_type} -> {self.recipient_id}"
