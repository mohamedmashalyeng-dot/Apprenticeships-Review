from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdmin, IsAdminOrModerator
from catalog.models import Company
from reviews.models import CompanyClaim, IngestionJob, Notification, Review, ReviewReport
from reviews.serializers import (
    CompanyClaimSerializer,
    IngestionJobSerializer,
    ModerateReviewSerializer,
    NotificationSerializer,
    ProviderResponseSerializer,
    RespondToReviewSerializer,
    ReviewCreateSerializer,
    ReviewReportSerializer,
    ReviewSerializer,
    ReviewUpdateSerializer,
)


def notify(recipient, notification_type, title, message="", link=""):
    if recipient is None:
        return
    Notification.objects.create(
        recipient=recipient, notification_type=notification_type, title=title, message=message, link=link
    )


class ReviewPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "limit"
    page_query_param = "page"

    def get_paginated_response(self, data):
        return Response(
            {
                "reviews": data,
                "page": self.page.number,
                "limit": self.get_page_size(self.request),
                "total": self.page.paginator.count,
                "totalPages": self.page.paginator.num_pages,
            }
        )


class ReviewViewSet(viewsets.ModelViewSet):
    lookup_field = "id"
    pagination_class = ReviewPagination

    def get_serializer_class(self):
        if self.action == "create":
            return ReviewCreateSerializer
        if self.action in ("update", "partial_update"):
            return ReviewUpdateSerializer
        return ReviewSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated()]
        # This override replaces the @action decorator's own `permission_classes` kwarg
        # entirely (DRF calls get_permissions(), not the decorator's stored value, once a
        # ViewSet overrides it) — moderate must stay staff-only here or that decorator-level
        # restriction is silently dead code and any authenticated user can moderate anyone's
        # review. See reviews/tests.py::test_ordinary_user_cannot_moderate.
        if self.action == "moderate":
            return [IsAdminOrModerator()]
        if self.action in ("update", "partial_update", "destroy", "respond"):
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        qs = Review.objects.select_related("company", "standard").prefetch_related("category_ratings")
        params = self.request.query_params
        if params.get("company"):
            qs = qs.filter(company__slug=params["company"])
        if params.get("standard"):
            # Not every review is tagged with a specific standard (imported/scraped reviews
            # rate the company overall, not one programme) — also match reviews for any
            # company known to deliver that standard, via the CompanyStandard link.
            qs = qs.filter(
                Q(standard__standard_id=params["standard"])
                | Q(company__standards__standard_id=params["standard"])
            ).distinct()
        if params.get("source"):
            qs = qs.filter(source__source_key=params["source"])
        if params.get("rating"):
            qs = qs.filter(rating=params["rating"])
        if params.get("mine") == "true" and self.request.user.is_authenticated:
            qs = qs.filter(reviewer_user=self.request.user)

        sort_by = params.get("sort_by")
        if sort_by == "oldest":
            qs = qs.order_by("review_date")
        elif sort_by == "highest":
            qs = qs.order_by("-rating")
        elif sort_by == "lowest":
            qs = qs.order_by("rating")
        elif sort_by == "created":
            qs = qs.order_by("-created_at")
        else:
            qs = qs.order_by("-review_date")

        user = self.request.user
        # A review still attached to an unapproved claim (no real company yet) isn't ready to
        # be moderated — hide it from the moderation queue. The reviewer still sees it via
        # ?mine=true regardless (filtered above), and it becomes moderatable once the claim
        # is approved and CompanyClaimViewSet.approve links it to the new company.
        if not (params.get("mine") == "true" and user.is_authenticated):
            qs = qs.filter(pending_claim__isnull=True)

        # Staff only get unapproved reviews when the caller explicitly asks for a moderation
        # context (?moderation_status=pending/rejected/flagged/all). Without that, an
        # admin/moderator just browsing an ordinary page (a provider profile, the reviews
        # feed) falls through to the same `visible` filter as everyone else below — otherwise
        # a pending or rejected review would blend in there as if already live, with no badge
        # to say it isn't.
        if user.is_authenticated and user.role in ("admin", "moderator") and params.get("moderation_status"):
            status_param = params["moderation_status"]
            return qs if status_param == "all" else qs.filter(moderation_status=status_param)
        visible = Q(moderation_status=Review.ModerationStatus.APPROVED)
        if user.is_authenticated:
            visible |= Q(reviewer_user=user)
            if user.role == "company_owner" and user.managed_company_id:
                visible |= Q(company_id=user.managed_company_id)
        return qs.filter(visible)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        review = self.get_object()
        serializer = self.get_serializer(review, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ReviewSerializer(review).data)

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if self.action in ("update", "partial_update"):
            user = request.user
            is_owner_author = obj.reviewer_user_id == user.id and obj.moderation_status == Review.ModerationStatus.PENDING
            is_moderator = user.role in ("admin", "moderator")
            if not (is_owner_author or is_moderator):
                self.permission_denied(request, message="You cannot edit this review.")
        if self.action == "destroy" and request.user.role not in ("admin", "moderator"):
            self.permission_denied(request, message="Only moderators may delete reviews.")

    @action(detail=True, methods=["post"])
    def helpful(self, request, id=None):
        delta = int(request.data.get("delta", 1))
        if delta not in (1, -1):
            return Response({"message": "delta must be 1 or -1."}, status=status.HTTP_400_BAD_REQUEST)
        review = get_object_or_404(Review, id=id, moderation_status=Review.ModerationStatus.APPROVED)
        review.helpful_count = max(0, review.helpful_count + delta)
        review.save(update_fields=["helpful_count"])
        return Response({"helpful_count": review.helpful_count})

    @action(detail=True, methods=["get"])
    def response(self, request, id=None):
        review = get_object_or_404(Review, id=id)
        if not review.response_text:
            return Response(None)
        return Response(ProviderResponseSerializer(review).data)

    @action(detail=True, methods=["patch"])
    def respond(self, request, id=None):
        review = get_object_or_404(Review.objects.select_related("company"), id=id)
        user = request.user
        if not (user.role == "company_owner" and user.managed_company_id == review.company_id):
            self.permission_denied(request, message="You can only respond to reviews about your own company.")
        serializer = RespondToReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(review)
        notify(
            review.reviewer_user,
            Notification.NotificationType.REVIEW_RESPONSE,
            title=f"{review.company.trading_name} responded to your review",
            message=review.review_title,
            link=f"/review/{review.id}",
        )
        return Response(ReviewSerializer(review).data)

    @action(detail=True, methods=["patch"], permission_classes=[IsAdminOrModerator])
    def moderate(self, request, id=None):
        review = get_object_or_404(Review.objects.select_related("company"), id=id)
        if review.pending_claim_id:
            return Response(
                {"message": "This review is waiting on its provider claim to be approved first."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ModerateReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(review)

        if review.moderation_status == Review.ModerationStatus.APPROVED:
            notify(
                review.reviewer_user,
                Notification.NotificationType.REVIEW_APPROVED,
                title="Your review was published",
                message=f"Your review of {review.company.trading_name} is now live.",
                link=f"/review/{review.id}",
            )
            for owner in review.company.managers.all():
                notify(
                    owner,
                    Notification.NotificationType.NEW_REVIEW_FOR_COMPANY,
                    title="New review published",
                    message=f"A new review was published for {review.company.trading_name}.",
                    link=f"/review/{review.id}",
                )
        elif review.moderation_status == Review.ModerationStatus.REJECTED:
            notify(
                review.reviewer_user,
                Notification.NotificationType.REVIEW_REJECTED,
                title="Your review wasn't published",
                message=f"Your review of {review.company.trading_name} didn't meet our review guidelines.",
                link="/review-policy",
            )
        return Response(ReviewSerializer(review).data)


class CompanyClaimViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyClaimSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        if self.action in ("update", "partial_update", "destroy"):
            return [IsAdminOrModerator()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = CompanyClaim.objects.select_related("company").order_by("-created_at")
        if self.request.query_params.get("status"):
            qs = qs.filter(status=self.request.query_params["status"])
        user = self.request.user
        if user.is_authenticated and user.role in ("admin", "moderator"):
            return qs
        return qs.filter(submitted_by=user) if user.is_authenticated else qs.none()

    def perform_create(self, serializer):
        user = self.request.user
        # `status` is otherwise read-only on this serializer, but force it here too — a claim
        # always starts pending regardless of what a caller puts in the request body.
        serializer.save(submitted_by=user if user.is_authenticated else None, status=CompanyClaim.Status.PENDING)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrModerator])
    def approve(self, request, pk=None):
        claim = get_object_or_404(CompanyClaim, pk=pk)
        company = claim.company
        if company is None:
            # No existing listing was referenced — this is a brand new provider, so create
            # it now and it'll show up in the public providers list like any other company.
            base_slug = slugify(claim.organisation_name) or "provider"
            slug = base_slug
            suffix = 2
            while Company.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{suffix}"
                suffix += 1
            company = Company.objects.create(
                slug=slug,
                trading_name=claim.organisation_name,
                website=claim.website,
                status=Company.Status.ACTIVE,
                verification_status=Company.VerificationStatus.VERIFIED,
            )
            claim.company = company

        if claim.submitted_by:
            claim.submitted_by.role = "company_owner"
            claim.submitted_by.managed_company = company
            claim.submitted_by.save(update_fields=["role", "managed_company"])

        claim.status = CompanyClaim.Status.APPROVED
        claim.reviewed_by = request.user
        claim.reviewed_at = timezone.now()
        claim.save(update_fields=["company", "status", "reviewed_by", "reviewed_at"])

        # Any review submitted against this claim while the provider didn't exist yet gets
        # linked to the now-real company and drops into the normal moderation queue — the
        # reviewer doesn't have to come back and resubmit it.
        pending_reviews = list(claim.pending_reviews.all())
        for review in pending_reviews:
            review.company = company
            review.pending_claim = None
            review.save(update_fields=["company", "pending_claim", "updated_at"])

        notify(
            claim.submitted_by,
            Notification.NotificationType.CLAIM_APPROVED,
            title="Your provider claim was approved",
            message=f"You're now the owner of {company.trading_name}.",
            link="/provider-dashboard",
        )
        if pending_reviews:
            notify(
                claim.submitted_by,
                Notification.NotificationType.CLAIM_APPROVED,
                title=f"{company.trading_name} is now live",
                message="Your review is now in our standard moderation queue.",
                link="/dashboard?tab=reviews",
            )
        return Response(CompanyClaimSerializer(claim).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrModerator])
    def reject(self, request, pk=None):
        claim = get_object_or_404(CompanyClaim, pk=pk)
        claim.status = CompanyClaim.Status.REJECTED
        claim.reviewed_by = request.user
        claim.reviewed_at = timezone.now()
        claim.save(update_fields=["status", "reviewed_by", "reviewed_at"])
        notify(
            claim.submitted_by,
            Notification.NotificationType.CLAIM_REJECTED,
            title="Your provider claim wasn't approved",
            message=f"We couldn't verify your claim for {claim.organisation_name}.",
            link="/claim-provider",
        )
        return Response(CompanyClaimSerializer(claim).data)


class ReviewReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewReportSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        if self.action in ("update", "partial_update", "destroy"):
            return [IsAdminOrModerator()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = ReviewReport.objects.select_related("review").order_by("-created_at")
        if self.request.query_params.get("status"):
            qs = qs.filter(status=self.request.query_params["status"])
        user = self.request.user
        if user.is_authenticated and user.role in ("admin", "moderator"):
            return qs
        return qs.filter(reporter=user) if user.is_authenticated else qs.none()

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(reporter=user if user.is_authenticated else None)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrModerator])
    def resolve(self, request, pk=None):
        report = get_object_or_404(ReviewReport, pk=pk)
        report.status = ReviewReport.Status.RESOLVED
        report.save(update_fields=["status"])
        return Response(ReviewReportSerializer(report).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrModerator])
    def dismiss(self, request, pk=None):
        report = get_object_or_404(ReviewReport, pk=pk)
        report.status = ReviewReport.Status.DISMISSED
        report.save(update_fields=["status"])
        return Response(ReviewReportSerializer(report).data)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=["post"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response(status=status.HTTP_204_NO_CONTENT)


class IngestionJobViewSet(viewsets.ModelViewSet):
    queryset = IngestionJob.objects.all()
    serializer_class = IngestionJobSerializer
    permission_classes = [IsAdmin]
