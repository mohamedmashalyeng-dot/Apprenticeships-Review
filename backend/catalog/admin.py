from django.contrib import admin

from catalog.models import (
    Category,
    Company,
    CompanySource,
    CompanyStandard,
    RatingCategory,
    ReviewSource,
    Standard,
    StandardFAQ,
)


class StandardFAQInline(admin.TabularInline):
    model = StandardFAQ
    extra = 0


@admin.register(Standard)
class StandardAdmin(admin.ModelAdmin):
    list_display = ("standard_name", "standard_id", "level", "has_landing_page")
    search_fields = ("standard_name", "standard_id")
    inlines = [StandardFAQInline]


class CompanyStandardInline(admin.TabularInline):
    model = CompanyStandard
    extra = 0


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("trading_name", "slug", "status", "verification_status", "average_rating", "total_reviews")
    list_filter = ("status", "verification_status", "company_type")
    search_fields = ("trading_name", "slug", "ukprn")
    inlines = [CompanyStandardInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "category_id", "sort_order")
    filter_horizontal = ("standards",)


admin.site.register(RatingCategory)
admin.site.register(ReviewSource)
admin.site.register(CompanySource)
