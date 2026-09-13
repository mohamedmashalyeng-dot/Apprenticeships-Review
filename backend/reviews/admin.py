from django.contrib import admin

from reviews.models import CompanyClaim, IngestionJob, Review, ReviewCategoryRating, ReviewReport


class ReviewCategoryRatingInline(admin.TabularInline):
    model = ReviewCategoryRating
    extra = 0


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("review_title", "company", "reviewer_type", "rating", "moderation_status", "review_date")
    list_filter = ("moderation_status", "verification_status", "reviewer_type")
    search_fields = ("review_title", "review_text", "company__trading_name")
    inlines = [ReviewCategoryRatingInline]


@admin.register(CompanyClaim)
class CompanyClaimAdmin(admin.ModelAdmin):
    list_display = ("organisation_name", "contact_name", "email", "status", "created_at")
    list_filter = ("status",)


@admin.register(ReviewReport)
class ReviewReportAdmin(admin.ModelAdmin):
    list_display = ("review", "reason", "status", "created_at")
    list_filter = ("status", "reason")


admin.site.register(IngestionJob)
