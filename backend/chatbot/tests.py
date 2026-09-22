import json

from django.test import SimpleTestCase

from chatbot.services import _parse_arguments


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
