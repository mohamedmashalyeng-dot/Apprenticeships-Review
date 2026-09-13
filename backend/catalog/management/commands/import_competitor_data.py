import hashlib

from django.db import connection, transaction
from django.core.management.base import BaseCommand

from catalog.models import Company, CompanyStandard, ReviewSource, Standard
from reviews.models import Review

# The 4 rows in `apprenticeship_programmes` use a different slug convention
# ("marketing-executive-l4") than this app's own Standard rows
# ("marketing-executive-level-4", which the React router/FAQs are built around).
# They correspond 1:1 by (programme_name, level), so map explicitly rather than
# renaming either side.
PROGRAMME_KEY_TO_STANDARD_SLUG = {
    "marketing-executive-l4": "marketing-executive-level-4",
    "marketing-manager-l6": "marketing-manager-level-6",
    "associate-project-manager-l4": "associate-project-manager-level-4",
    "project-controls-professional-l6": "project-controls-professional-level-6",
}


class Command(BaseCommand):
    help = (
        "Replace placeholder/demo company & review data with the real data already "
        "collected in this database's competitor_* / apprenticeship_programmes tables."
    )

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Clearing placeholder company/review data...")
        Review.objects.all().delete()
        CompanyStandard.objects.all().delete()
        Company.objects.all().delete()

        with connection.cursor() as cur:
            cur.execute("SELECT id, slug, name, website_url FROM competitors")
            competitor_rows = cur.fetchall()

            cur.execute("SELECT id, standard_key FROM apprenticeship_programmes")
            programme_rows = cur.fetchall()

            cur.execute(
                "SELECT competitor_id, programme_id FROM competitor_apprenticeship_programmes WHERE active = true"
            )
            link_rows = cur.fetchall()

            cur.execute(
                """
                SELECT cr.competitor_id, cr.source_review_id, cr.rating_value, cr.title,
                       cr.review_text, cr.review_date, cr.is_verified, cr.reviewer_name,
                       rs.source_key, rs.source_name
                FROM competitor_reviews cr
                JOIN competitor_rating_sources rs ON rs.id = cr.rating_source_id
                WHERE cr.rating_value IS NOT NULL
                """
            )
            review_rows = cur.fetchall()

        slug_by_competitor_id = {}
        new_companies = []
        for competitor_id, slug, name, website_url in competitor_rows:
            slug_by_competitor_id[competitor_id] = slug
            new_companies.append(
                Company(
                    slug=slug,
                    trading_name=name,
                    website=website_url or "",
                    status=Company.Status.ACTIVE,
                    verification_status=Company.VerificationStatus.PENDING,
                )
            )
        Company.objects.bulk_create(new_companies, batch_size=500)
        companies_by_slug = {c.slug: c for c in Company.objects.all()}
        companies_by_competitor_id = {
            cid: companies_by_slug[slug] for cid, slug in slug_by_competitor_id.items()
        }
        self.stdout.write(f"companies: {len(companies_by_competitor_id)}")

        standards_by_programme_id = {}
        standards_by_slug = {s.standard_id: s for s in Standard.objects.all()}
        for programme_id, standard_key in programme_rows:
            slug = PROGRAMME_KEY_TO_STANDARD_SLUG.get(standard_key)
            if slug and slug in standards_by_slug:
                standards_by_programme_id[programme_id] = standards_by_slug[slug]

        links = []
        seen = set()
        for competitor_id, programme_id in link_rows:
            company = companies_by_competitor_id.get(competitor_id)
            standard = standards_by_programme_id.get(programme_id)
            if not company or not standard or (company.id, standard.id) in seen:
                continue
            seen.add((company.id, standard.id))
            links.append(CompanyStandard(company=company, standard=standard))
        CompanyStandard.objects.bulk_create(links, batch_size=500)
        self.stdout.write(f"company-standard links: {len(links)}")

        sources_by_key = {}
        reviews = []
        skipped = 0
        for (
            competitor_id,
            source_review_id,
            rating_value,
            title,
            review_text,
            review_date,
            is_verified,
            reviewer_name,
            source_key,
            source_name,
        ) in review_rows:
            company = companies_by_competitor_id.get(competitor_id)
            if not company:
                skipped += 1
                continue
            text = (review_text or title or "").strip()
            if not text:
                skipped += 1
                continue
            if source_key not in sources_by_key:
                sources_by_key[source_key], _ = ReviewSource.objects.get_or_create(
                    source_key=source_key, defaults={"display_name": source_name, "is_external_api": True}
                )
            source = sources_by_key[source_key]
            fingerprint = hashlib.sha256(f"{source_key}|{source_review_id}".encode()).hexdigest()
            reviews.append(
                Review(
                    company=company,
                    source=source,
                    reviewer_type=Review.ReviewerType.LEARNER,
                    reviewer_name=reviewer_name or "",
                    rating=rating_value,
                    review_title=(title or text[:100]).strip() or "Review",
                    review_text=text,
                    review_date=review_date,
                    verification_status=(
                        Review.VerificationStatus.VERIFIED if is_verified else Review.VerificationStatus.PENDING
                    ),
                    moderation_status=Review.ModerationStatus.APPROVED,
                    external_review_id=source_review_id,
                    content_fingerprint=fingerprint,
                )
            )
        Review.objects.bulk_create(reviews, batch_size=500, ignore_conflicts=True)
        self.stdout.write(f"reviews: {len(reviews)} (skipped {skipped} with no rating/text)")

        self.stdout.write("Recalculating company rating stats...")
        from reviews.signals import recalculate_company_stats

        for company_id in Review.objects.values_list("company_id", flat=True).distinct():
            recalculate_company_stats(company_id)

        self.stdout.write(self.style.SUCCESS("Import complete."))
