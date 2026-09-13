import uuid

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models


class Standard(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    standard_id = models.SlugField(max_length=150, unique=True)
    standard_name = models.CharField(max_length=255)
    level = models.IntegerField()
    sector = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    who_for = models.TextField(blank=True)
    typical_learner = models.TextField(blank=True)
    typical_employer = models.TextField(blank=True)
    duration = models.CharField(max_length=255, blank=True)
    max_funding = models.CharField(max_length=255, blank=True)
    has_landing_page = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.standard_name


class StandardFAQ(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    standard = models.ForeignKey(Standard, on_delete=models.CASCADE, related_name="faqs")
    question = models.TextField()
    answer = models.TextField()
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self) -> str:
        return self.question


class RatingCategory(models.Model):
    key = models.SlugField(max_length=100, primary_key=True)
    label = models.CharField(max_length=255)
    short_label = models.CharField(max_length=100)
    icon = models.CharField(max_length=100)
    description = models.TextField()
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self) -> str:
        return self.label


class Category(models.Model):
    class Accent(models.TextChoices):
        PRIMARY = "primary", "Primary"
        SECONDARY = "secondary", "Secondary"
        ACCENT = "accent", "Accent"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category_id = models.SlugField(max_length=150, unique=True)
    name = models.CharField(max_length=255)
    icon = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    accent = models.CharField(max_length=20, choices=Accent.choices, default=Accent.PRIMARY)
    sort_order = models.IntegerField(default=0)
    standards = models.ManyToManyField(Standard, related_name="categories", blank=True)

    class Meta:
        ordering = ["sort_order"]
        verbose_name_plural = "categories"

    def __str__(self) -> str:
        return self.name


class Company(models.Model):
    class CompanyType(models.TextChoices):
        APPRENTICESHIP_PROVIDER = "apprenticeship_provider", "Apprenticeship provider"
        COLLEGE = "college", "College"
        TRAINING_PROVIDER = "training_provider", "Training provider"
        EMPLOYER = "employer", "Employer"
        UNIVERSITY = "university", "University"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        PENDING = "pending", "Pending"
        SUSPENDED = "suspended", "Suspended"
        MERGED = "merged", "Merged"

    class VerificationStatus(models.TextChoices):
        VERIFIED = "Verified", "Verified"
        PENDING = "Pending", "Pending"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=255, unique=True)
    trading_name = models.CharField(max_length=255)
    legal_name = models.CharField(max_length=255, blank=True)
    ukprn = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    ofsted_status = models.CharField(max_length=255, blank=True, default="Not Publicly Available")
    verification_status = models.CharField(
        max_length=20, choices=VerificationStatus.choices, default=VerificationStatus.PENDING
    )
    delivery_model = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    strengths = ArrayField(models.TextField(), default=list, blank=True)
    weaknesses = ArrayField(models.TextField(), default=list, blank=True)
    best_for = ArrayField(models.TextField(), default=list, blank=True)
    logo_url = models.URLField(blank=True)
    data_last_updated = models.DateField(null=True, blank=True)
    company_type = models.CharField(
        max_length=30, choices=CompanyType.choices, default=CompanyType.TRAINING_PROVIDER
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="owned_companies",
    )
    average_rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    total_reviews = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    standards = models.ManyToManyField(Standard, through="CompanyStandard", related_name="companies")

    class Meta:
        verbose_name_plural = "companies"

    def __str__(self) -> str:
        return self.trading_name


class CompanyStandard(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    standard = models.ForeignKey(Standard, on_delete=models.CASCADE)
    delivery_status = models.CharField(max_length=50, default="Active")
    evidence_source = models.CharField(
        max_length=255, blank=True, default="Register of Apprenticeship Training Providers"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["company", "standard"], name="unique_company_standard")
        ]

    def __str__(self) -> str:
        return f"{self.company} -> {self.standard}"


class ReviewSource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_key = models.SlugField(max_length=50, unique=True)
    display_name = models.CharField(max_length=255)
    website_url = models.URLField(blank=True)
    is_external_api = models.BooleanField(default=False)
    config = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.display_name


class SavedProvider(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_providers")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "company"], name="unique_user_saved_company")
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user_id} saved {self.company.slug}"


class CompanySource(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    source = models.ForeignKey(ReviewSource, on_delete=models.CASCADE)
    external_id = models.CharField(max_length=255, blank=True)
    external_url = models.URLField(blank=True)
    enabled = models.BooleanField(default=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["company", "source"], name="unique_company_source")
        ]

    def __str__(self) -> str:
        return f"{self.company} <- {self.source}"
