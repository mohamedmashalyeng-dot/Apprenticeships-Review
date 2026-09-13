from rest_framework.routers import DefaultRouter

from reviews.views import (
    CompanyClaimViewSet,
    IngestionJobViewSet,
    NotificationViewSet,
    ReviewReportViewSet,
    ReviewViewSet,
)

router = DefaultRouter()
router.register("reviews", ReviewViewSet, basename="review")
router.register("company-claims", CompanyClaimViewSet, basename="company-claim")
router.register("review-reports", ReviewReportViewSet, basename="review-report")
router.register("ingestion-jobs", IngestionJobViewSet, basename="ingestion-job")
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = router.urls
