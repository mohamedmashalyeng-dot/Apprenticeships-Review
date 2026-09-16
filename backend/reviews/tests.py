"""Authorization regression tests for the review moderation trust boundary.

These lock in the fixes made after a review found that:
  1. An admin/moderator casually browsing an ordinary page (no explicit moderation
     context) could see pending/rejected reviews blended in as if already live.
  2. A review's own author could sneak `moderation_status` into a PATCH to
     /reviews/{id}/ and self-approve their own pending review.

Run with: python manage.py test reviews
"""
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from catalog.models import Company
from reviews.models import Notification, Review

User = get_user_model()


class ReviewAuthorizationTests(APITestCase):
    def setUp(self):
        self.company = Company.objects.create(
            slug="test-provider",
            trading_name="Test Provider",
            status=Company.Status.ACTIVE,
        )
        self.learner = User.objects.create_user(
            username="learner1", email="learner1@example.com", password="pass12345!", role="user"
        )
        self.other_user = User.objects.create_user(
            username="learner2", email="learner2@example.com", password="pass12345!", role="user"
        )
        self.moderator = User.objects.create_user(
            username="mod1", email="mod1@example.com", password="pass12345!", role="moderator"
        )

    def _submit_review(self, user, title="A test review"):
        self.client.force_authenticate(user=user)
        response = self.client.post(
            "/api/reviews/",
            {
                "company_slug": self.company.slug,
                "reviewer_type": "learner",
                "rating": 4,
                "review_title": title,
                "review_text": "Some genuine review text.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        return response.data

    # ---- a review always starts pending, regardless of what the client sends ----

    def test_new_review_defaults_to_pending(self):
        review = self._submit_review(self.learner)
        self.assertEqual(review["moderation_status"], "pending")

    def test_client_cannot_set_moderation_status_on_create(self):
        self.client.force_authenticate(user=self.learner)
        response = self.client.post(
            "/api/reviews/",
            {
                "company_slug": self.company.slug,
                "reviewer_type": "learner",
                "rating": 5,
                "review_title": "Trying to self-approve on create",
                "review_text": "text",
                "moderation_status": "approved",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["moderation_status"], "pending")

    # ---- pending/rejected reviews never leak into public-facing views ----

    def test_pending_review_hidden_from_anonymous(self):
        review = self._submit_review(self.learner)
        self.client.force_authenticate(user=None)

        detail = self.client.get(f"/api/reviews/{review['review_id']}/")
        self.assertEqual(detail.status_code, status.HTTP_404_NOT_FOUND)

        listing = self.client.get(f"/api/reviews/?company={self.company.slug}")
        ids = [r["review_id"] for r in listing.data["reviews"]]
        self.assertNotIn(review["review_id"], ids)

    def test_staff_does_not_see_pending_review_without_explicit_moderation_context(self):
        """A staff account browsing an ordinary page (no ?moderation_status=) must see
        exactly what a real visitor sees. Regression test for the bug where an
        admin/moderator viewing a provider page saw unapproved reviews blended in with
        no badge, purely because of who was logged in."""
        review = self._submit_review(self.learner)
        self.client.force_authenticate(user=self.moderator)

        listing = self.client.get(f"/api/reviews/?company={self.company.slug}")
        ids = [r["review_id"] for r in listing.data["reviews"]]
        self.assertNotIn(review["review_id"], ids)

        detail = self.client.get(f"/api/reviews/{review['review_id']}/")
        self.assertEqual(detail.status_code, status.HTTP_404_NOT_FOUND)

    def test_staff_sees_pending_review_with_explicit_moderation_status(self):
        review = self._submit_review(self.learner)
        self.client.force_authenticate(user=self.moderator)

        for query in ("moderation_status=pending", "moderation_status=all"):
            with self.subTest(query=query):
                listing = self.client.get(f"/api/reviews/?company={self.company.slug}&{query}")
                ids = [r["review_id"] for r in listing.data["reviews"]]
                self.assertIn(review["review_id"], ids)

        detail = self.client.get(f"/api/reviews/{review['review_id']}/?moderation_status=all")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)

    def test_rejected_review_never_becomes_publicly_visible(self):
        review = self._submit_review(self.learner)
        self.client.force_authenticate(user=self.moderator)
        moderate = self.client.patch(
            f"/api/reviews/{review['review_id']}/moderate/", {"moderation_status": "rejected"}, format="json"
        )
        self.assertEqual(moderate.status_code, status.HTTP_200_OK)

        self.client.force_authenticate(user=None)
        detail = self.client.get(f"/api/reviews/{review['review_id']}/")
        self.assertEqual(detail.status_code, status.HTTP_404_NOT_FOUND)

    def test_approved_review_becomes_publicly_visible(self):
        review = self._submit_review(self.learner)
        self.client.force_authenticate(user=self.moderator)
        self.client.patch(
            f"/api/reviews/{review['review_id']}/moderate/", {"moderation_status": "approved"}, format="json"
        )

        self.client.force_authenticate(user=None)
        detail = self.client.get(f"/api/reviews/{review['review_id']}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)

    # ---- only staff may moderate ----

    def test_ordinary_user_cannot_moderate(self):
        review = self._submit_review(self.learner)
        self.client.force_authenticate(user=self.other_user)
        response = self.client.patch(
            f"/api/reviews/{review['review_id']}/moderate/", {"moderation_status": "approved"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_moderate(self):
        review = self._submit_review(self.learner)
        self.client.force_authenticate(user=None)
        response = self.client.patch(
            f"/api/reviews/{review['review_id']}/moderate/", {"moderation_status": "approved"}, format="json"
        )
        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    # ---- moderation notifies the author ----

    def test_approve_notifies_author(self):
        review = self._submit_review(self.learner)
        self.client.force_authenticate(user=self.moderator)
        self.client.patch(
            f"/api/reviews/{review['review_id']}/moderate/", {"moderation_status": "approved"}, format="json"
        )
        self.assertTrue(
            Notification.objects.filter(recipient=self.learner, notification_type="review_approved").exists()
        )

    def test_reject_notifies_author(self):
        review = self._submit_review(self.learner)
        self.client.force_authenticate(user=self.moderator)
        self.client.patch(
            f"/api/reviews/{review['review_id']}/moderate/", {"moderation_status": "rejected"}, format="json"
        )
        self.assertTrue(
            Notification.objects.filter(recipient=self.learner, notification_type="review_rejected").exists()
        )

    # ---- editing boundaries ----

    def test_author_can_edit_own_pending_review(self):
        review = self._submit_review(self.learner)
        self.client.force_authenticate(user=self.learner)
        response = self.client.patch(
            f"/api/reviews/{review['review_id']}/",
            {"rating": 5, "review_title": "Edited title", "review_text": "Edited text."},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["review_title"], "Edited title")
        self.assertEqual(response.data["moderation_status"], "pending")

    def test_author_cannot_edit_after_moderation(self):
        review = self._submit_review(self.learner)
        self.client.force_authenticate(user=self.moderator)
        self.client.patch(
            f"/api/reviews/{review['review_id']}/moderate/", {"moderation_status": "approved"}, format="json"
        )

        self.client.force_authenticate(user=self.learner)
        response = self.client.patch(
            f"/api/reviews/{review['review_id']}/",
            {"rating": 1, "review_title": "Trying to edit after approval", "review_text": "text"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_cannot_edit_someone_elses_review(self):
        # The review isn't even in `other_user`'s visible queryset (still pending, not
        # theirs), so this 404s rather than 403s — the API doesn't confirm the review
        # exists to a caller who has no business knowing that.
        review = self._submit_review(self.learner)
        self.client.force_authenticate(user=self.other_user)
        response = self.client.patch(
            f"/api/reviews/{review['review_id']}/",
            {"rating": 1, "review_title": "hijacked", "review_text": "text"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_author_cannot_self_approve_via_edit(self):
        """The exact bug found and fixed: injecting moderation_status into a PATCH to
        /reviews/{id}/ must be silently ignored, never applied."""
        review = self._submit_review(self.learner)
        self.client.force_authenticate(user=self.learner)
        response = self.client.patch(
            f"/api/reviews/{review['review_id']}/",
            {
                "rating": 5,
                "review_title": "Trying to self-approve",
                "review_text": "text",
                "moderation_status": "approved",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["moderation_status"], "pending")
        review_obj = Review.objects.get(id=review["review_id"])
        self.assertEqual(review_obj.moderation_status, Review.ModerationStatus.PENDING)
