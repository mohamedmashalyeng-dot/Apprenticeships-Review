import json

from django.test import SimpleTestCase
from django.test import TestCase

from catalog.models import Company, CompanyStandard, Standard
from chatbot.services import _parse_arguments, compare_providers, get_provider_details, search_standards


class ParseArgumentsTests(SimpleTestCase):
    def test_ignores_unknown_arguments_and_normalizes_types(self):
        args = _parse_arguments(
            {
                "arguments": json.dumps(
                    {
                        "sector": "software",
                        "level": "4",
                        "min_rating": "9",
                        "unexpected": "ignored",
                    }
                )
            }
        )

        self.assertEqual(args, {"sector": "software", "level": 4, "min_rating": 5})

    def test_invalid_json_returns_empty_arguments(self):
        self.assertEqual(_parse_arguments({"arguments": "{"}), {})

    def test_provider_ids_are_limited_and_stringified(self):
        args = _parse_arguments(
            {
                "name": "compare_providers",
                "arguments": json.dumps({"provider_ids": ["one", 2, "three", "four", "five"]}),
            },
            "compare_providers",
        )

        self.assertEqual(args, {"provider_ids": ["one", "2", "three", "four"]})


class ChatbotToolTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(
            slug="smart-training",
            trading_name="Smart Training",
            status=Company.Status.ACTIVE,
            location="London",
            average_rating=4.5,
            total_reviews=12,
            description="A strong digital apprenticeship provider.",
        )
        self.standard = Standard.objects.create(
            standard_id="software-developer-level-4",
            standard_name="Software Developer",
            level=4,
            sector="Digital",
            description="Build and test software applications.",
        )
        CompanyStandard.objects.create(company=self.company, standard=self.standard)

    def test_get_provider_details_returns_active_provider_profile(self):
        details = get_provider_details(provider_name="Smart")

        self.assertEqual(details["provider_id"], "smart-training")
        self.assertEqual(details["profile_path"], "/provider/smart-training")
        self.assertEqual(details["standards"][0]["standard_id"], "software-developer-level-4")

    def test_search_standards_returns_provider_count(self):
        results = search_standards(query="software", level=4)

        self.assertEqual(results[0]["standard_id"], "software-developer-level-4")
        self.assertEqual(results[0]["provider_count"], 1)

    def test_compare_providers_matches_by_slug_or_name(self):
        results = compare_providers(["smart-training", "Smart"])

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "Smart Training")
