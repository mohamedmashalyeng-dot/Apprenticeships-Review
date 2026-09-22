from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from catalog.models import Company, CompanyStandard, Standard

User = get_user_model()


class CompanyVisibilityTests(APITestCase):
    def setUp(self):
        self.active_company = Company.objects.create(
            slug="active-provider",
            trading_name="Active Provider",
            status=Company.Status.ACTIVE,
        )
        self.suspended_company = Company.objects.create(
            slug="suspended-provider",
            trading_name="Suspended Provider",
            status=Company.Status.SUSPENDED,
        )
        self.standard = Standard.objects.create(
            standard_id="ST0001",
            standard_name="Software Developer",
            level=4,
            sector="Digital",
        )
        CompanyStandard.objects.create(company=self.active_company, standard=self.standard)
        CompanyStandard.objects.create(company=self.suspended_company, standard=self.standard)

    def test_public_company_subactions_hide_suspended_companies(self):
        for action in ("standards", "score", "rating-summary"):
            with self.subTest(action=action):
                response = self.client.get(f"/api/companies/{self.suspended_company.slug}/{action}/")
                self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_bulk_standard_links_hide_suspended_companies(self):
        response = self.client.get("/api/companies/all-standards/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        provider_ids = {item["provider_id"] for item in response.data}

        self.assertIn(self.active_company.slug, provider_ids)
        self.assertNotIn(self.suspended_company.slug, provider_ids)
