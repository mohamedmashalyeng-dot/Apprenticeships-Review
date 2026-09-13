import urllib.error
import urllib.request
from urllib.parse import urlparse

from django.core.management.base import BaseCommand

from catalog.models import Company

# DuckDuckGo's public icon proxy (used for their own search-result favicons) — no API key,
# no scraping, just "give me the favicon for this domain." Returns HTTP 404 (with a generic
# placeholder body) when it has no icon for the domain, which we treat as "skip".
ICON_SERVICE_URL = "https://icons.duckduckgo.com/ip3/{domain}.ico"


def extract_domain(website: str) -> str | None:
    parsed = urlparse(website if "://" in website else f"//{website}", scheme="https")
    host = (parsed.netloc or parsed.path).split("/")[0].split(":")[0]
    if host.startswith("www."):
        host = host[4:]
    return host or None


class Command(BaseCommand):
    help = (
        "Backfill empty Company.logo_url by looking up each provider's website domain against "
        "DuckDuckGo's public favicon service. Only sets it when the service actually has an icon."
    )

    def handle(self, *args, **options):
        companies = Company.objects.exclude(website="").filter(logo_url="")
        updated = 0
        skipped = 0

        for company in companies:
            domain = extract_domain(company.website)
            if not domain:
                skipped += 1
                continue

            url = ICON_SERVICE_URL.format(domain=domain)
            request = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "Mozilla/5.0"})
            try:
                with urllib.request.urlopen(request, timeout=8) as response:
                    found = response.status == 200
            except Exception:
                found = False

            if found:
                company.logo_url = url
                company.save(update_fields=["logo_url"])
                updated += 1
            else:
                skipped += 1

        self.stdout.write(self.style.SUCCESS(f"Set logos for {updated} companies, skipped {skipped} (no icon found)."))
