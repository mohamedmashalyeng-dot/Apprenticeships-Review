from django.urls import path
from rest_framework.routers import DefaultRouter

from catalog.views import (
    CategoryViewSet,
    CompanyViewSet,
    RatingCategoryViewSet,
    ReviewSourceViewSet,
    SavedProviderViewSet,
    StandardViewSet,
    platform_stats,
)

router = DefaultRouter()
router.register("companies", CompanyViewSet, basename="company")
router.register("standards", StandardViewSet, basename="standard")
router.register("categories", CategoryViewSet, basename="category")
router.register("rating-categories", RatingCategoryViewSet, basename="rating-category")
router.register("review-sources", ReviewSourceViewSet, basename="review-source")
router.register("saved-providers", SavedProviderViewSet, basename="saved-provider")

urlpatterns = [path("platform-stats/", platform_stats, name="platform-stats")] + router.urls
