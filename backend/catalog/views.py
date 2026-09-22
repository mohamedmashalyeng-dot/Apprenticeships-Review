from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes as perm_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdmin, IsAdminOrReadOnly
from catalog.models import Category, Company, CompanyStandard, RatingCategory, ReviewSource, SavedProvider, Standard
from catalog.serializers import (
    CategorySerializer,
    CompanySerializer,
    ProviderStandardLinkSerializer,
    RatingCategorySerializer,
    ReviewSourceSerializer,
    SavedProviderSerializer,
    StandardFAQSerializer,
    StandardSerializer,
)


def _company_standard_links(qs):
    return [
        {
            "provider_id": link.company.slug,
            "standard_id": link.standard.standard_id,
            "delivery_status": link.delivery_status,
            "evidence_source": link.evidence_source,
        }
        for link in qs.select_related("company", "standard")
    ]


class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    lookup_field = "slug"
    lookup_value_regex = "[^/]+"

    def get_permissions(self):
        if self.action in ("create", "destroy"):
            return [IsAdmin()]
        if self.action in ("update", "partial_update", "archive"):
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        from django.db.models import Count

        from reviews.models import Review

        # Single round trip instead of prefetch_related's separate queries — each extra
        # query to the remote DB costs a full network round trip (~150-450ms here), so
        # collapsing category/level lookups into this same annotated query matters a lot.
        qs = Company.objects.annotate(
            _recommend_yes=Count(
                "reviews",
                filter=Q(
                    reviews__moderation_status=Review.ModerationStatus.APPROVED,
                    reviews__would_recommend=True,
                ),
                distinct=True,
            ),
            _recommend_total=Count(
                "reviews",
                filter=Q(
                    reviews__moderation_status=Review.ModerationStatus.APPROVED,
                    reviews__would_recommend__isnull=False,
                ),
                distinct=True,
            ),
            _category_names=ArrayAgg(
                "standards__categories__name",
                distinct=True,
                filter=Q(standards__categories__name__isnull=False),
            ),
            _levels=ArrayAgg(
                "standards__level",
                distinct=True,
                filter=Q(standards__isnull=False),
            ),
        )
        user = self.request.user
        if user.is_authenticated and user.role in ("admin", "moderator"):
            pass
        elif user.is_authenticated and user.role == "company_owner":
            qs = qs.filter(Q(status=Company.Status.ACTIVE) | Q(id=user.managed_company_id))
        else:
            qs = qs.filter(status=Company.Status.ACTIVE)

        params = self.request.query_params
        if params.get("search"):
            q = params["search"].strip()
            qs = qs.filter(
                Q(trading_name__icontains=q)
                | Q(legal_name__icontains=q)
                | Q(location__icontains=q)
                | Q(ukprn__icontains=q)
            )
        if params.get("location") and params["location"] != "all":
            qs = qs.filter(location__istartswith=params["location"])
        if params.get("category") and params["category"] != "all":
            qs = qs.filter(standards__categories__category_id=params["category"])
        if params.get("level"):
            qs = qs.filter(standards__level=params["level"])
        if params.get("standard"):
            qs = qs.filter(standards__standard_id=params["standard"])
        if params.get("min_rating"):
            qs = qs.filter(average_rating__gte=params["min_rating"])
        if params.get("min_review_count"):
            qs = qs.filter(total_reviews__gte=params["min_review_count"])
        if params.get("category") or params.get("level") or params.get("standard"):
            qs = qs.distinct()

        sort_by = params.get("sort_by")
        if sort_by == "reviews":
            qs = qs.order_by("-total_reviews")
        elif sort_by == "name":
            qs = qs.order_by("trading_name")
        else:
            qs = qs.order_by("-average_rating")
        return qs

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if self.action in ("update", "partial_update", "archive"):
            user = request.user
            is_admin = user.role == "admin"
            is_owner = user.role == "company_owner" and user.managed_company_id == obj.id
            if not (is_admin or is_owner):
                self.permission_denied(request, message="You cannot edit this company.")

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def archive(self, request, slug=None):
        company = self.get_object()
        company.status = Company.Status.SUSPENDED
        company.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(company).data)

    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def standards(self, request, slug=None):
        company = self.get_object()
        links = CompanyStandard.objects.filter(company=company)
        return Response(_company_standard_links(links))

    @action(detail=False, methods=["get"], permission_classes=[AllowAny], url_path="all-standards")
    def all_standards(self, request):
        # Bulk equivalent of the per-company `standards` action above — lets a page needing
        # every company's standard links do it in one request instead of one per company.
        links = CompanyStandard.objects.filter(company__status=Company.Status.ACTIVE).select_related("company", "standard")
        return Response(_company_standard_links(links))

    @action(detail=True, methods=["get"], permission_classes=[IsAdmin])
    def sources(self, request, slug=None):
        from catalog.models import CompanySource

        company = get_object_or_404(Company, slug=slug)
        rows = CompanySource.objects.filter(company=company).select_related("source")
        return Response(
            [
                {
                    "source_key": r.source.source_key,
                    "display_name": r.source.display_name,
                    "external_id": r.external_id,
                    "external_url": r.external_url,
                    "enabled": r.enabled,
                }
                for r in rows
            ]
        )

    @action(
        detail=True,
        methods=["put", "patch"],
        url_path="sources/(?P<source_key>[^/]+)",
        permission_classes=[IsAdmin],
    )
    def upsert_source(self, request, slug=None, source_key=None):
        from catalog.models import CompanySource

        company = get_object_or_404(Company, slug=slug)
        source = get_object_or_404(ReviewSource, source_key=source_key)
        CompanySource.objects.update_or_create(
            company=company,
            source=source,
            defaults={
                "external_id": request.data.get("external_id") or "",
                "external_url": request.data.get("external_url") or "",
                "enabled": request.data.get("enabled", True),
            },
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def score(self, request, slug=None):
        company = self.get_object()
        return Response(
            {
                "provider_id": company.slug,
                "learner_experience_score": 0,
                "employer_satisfaction_score": 0,
                "outcome_score": 0,
                "quality_score": 0,
                "confidence_score": 0,
                "overall_score": 0,
                "data_confidence_label": "Not Publicly Available",
            }
        )

    @action(detail=True, methods=["get"], permission_classes=[AllowAny], url_path="rating-summary")
    def rating_summary(self, request, slug=None):
        from reviews.models import Review, ReviewCategoryRating

        company = self.get_object()
        approved = Review.objects.filter(company=company, moderation_status=Review.ModerationStatus.APPROVED)
        agg = approved.aggregate(overall=Avg("rating"), review_count=Count("id"))
        recommend_total = approved.filter(would_recommend__isnull=False).count()
        recommend_yes = approved.filter(would_recommend=True).count()
        recommendation_percent = round(100 * recommend_yes / recommend_total) if recommend_total else None

        categories = {}
        for row in (
            ReviewCategoryRating.objects.filter(review__in=approved)
            .values("category_id")
            .annotate(avg_rating=Avg("rating"))
        ):
            categories[row["category_id"]] = round(float(row["avg_rating"]), 2)

        distribution = {str(i): 0 for i in range(1, 6)}
        for row in approved.values("rating"):
            star = str(round(float(row["rating"])))
            if star in distribution:
                distribution[star] += 1

        return Response(
            {
                "provider_id": company.slug,
                "overall": round(float(agg["overall"] or 0), 2),
                "review_count": agg["review_count"] or 0,
                "recommendation_percent": recommendation_percent,
                "categories": categories,
                "distribution": distribution,
            }
        )


class StandardViewSet(viewsets.ModelViewSet):
    queryset = Standard.objects.all()
    serializer_class = StandardSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "standard_id"
    lookup_value_regex = "[^/]+"

    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def faqs(self, request, standard_id=None):
        standard = get_object_or_404(Standard, standard_id=standard_id)
        return Response(StandardFAQSerializer(standard.faqs.all(), many=True).data)

    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def providers(self, request, standard_id=None):
        standard = get_object_or_404(Standard, standard_id=standard_id)
        links = CompanyStandard.objects.filter(standard=standard, company__status=Company.Status.ACTIVE)
        return Response(_company_standard_links(links))


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.prefetch_related("standards").all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "category_id"
    lookup_value_regex = "[^/]+"


class RatingCategoryViewSet(viewsets.ModelViewSet):
    queryset = RatingCategory.objects.all()
    serializer_class = RatingCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "key"


class ReviewSourceViewSet(viewsets.ModelViewSet):
    queryset = ReviewSource.objects.all()
    serializer_class = ReviewSourceSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "source_key"


class SavedProviderViewSet(viewsets.ModelViewSet):
    serializer_class = SavedProviderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "company__slug"
    lookup_url_kwarg = "slug"
    lookup_value_regex = "[^/]+"
    http_method_names = ["get", "post", "delete"]

    def get_queryset(self):
        return SavedProvider.objects.filter(user=self.request.user).select_related("company")

    def create(self, request, *args, **kwargs):
        slug = request.data.get("provider_id")
        company = get_object_or_404(Company, slug=slug)
        saved, _ = SavedProvider.objects.get_or_create(user=request.user, company=company)
        return Response(SavedProviderSerializer(saved).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@perm_classes([AllowAny])
def platform_stats(request):
    from reviews.models import Review

    approved = Review.objects.filter(moderation_status=Review.ModerationStatus.APPROVED)
    agg = approved.aggregate(avg=Avg("rating"), count=Count("id"))
    return Response(
        {
            "totalCompanies": Company.objects.filter(status=Company.Status.ACTIVE).count(),
            "totalReviews": agg["count"] or 0,
            "averageRating": round(float(agg["avg"] or 0), 1),
            "learnerReviews": approved.filter(reviewer_type=Review.ReviewerType.LEARNER).count(),
            "employerReviews": approved.filter(reviewer_type=Review.ReviewerType.EMPLOYER).count(),
        }
    )
