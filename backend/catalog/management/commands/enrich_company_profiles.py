from django.db import connection
from django.core.management.base import BaseCommand

from catalog.models import Company


class Command(BaseCommand):
    help = (
        "Backfill empty Company profile fields (UKPRN, legal name, location, Ofsted status) from "
        "the government data already collected in competitor_apar_profiles / competitor_ofsted_* — "
        "unlike import_competitor_data, this only fills blanks and never touches reviews."
    )

    def handle(self, *args, **options):
        with connection.cursor() as cur:
            cur.execute("SELECT id, slug FROM competitors")
            competitor_id_by_slug = {slug: cid for cid, slug in cur.fetchall()}

            cur.execute("SELECT competitor_id, ukprn, provider_name FROM competitor_apar_profiles")
            apar_by_competitor = {cid: (ukprn, provider_name) for cid, ukprn, provider_name in cur.fetchall()}

            cur.execute(
                "SELECT competitor_id, provider_name, local_authority, region FROM competitor_ofsted_provider_status"
            )
            ofsted_provider_by_competitor = {
                cid: (provider_name, local_authority, region) for cid, provider_name, local_authority, region in cur.fetchall()
            }

            # A competitor can have both a legacy-framework row and a newer full_inspection row —
            # prefer full_inspection (current framework) when both exist, per competitor.
            cur.execute(
                """
                SELECT competitor_id, inspection_type, legacy_overall_effectiveness_label, apprenticeships_achievement
                FROM competitor_ofsted_inspections
                ORDER BY competitor_id, (inspection_type = 'full_inspection') DESC
                """
            )
            ofsted_label_by_competitor = {}
            for competitor_id, inspection_type, legacy_label, apprenticeships_achievement in cur.fetchall():
                if competitor_id in ofsted_label_by_competitor:
                    continue
                label = legacy_label or apprenticeships_achievement
                if label:
                    ofsted_label_by_competitor[competitor_id] = label

        updated = 0
        for company in Company.objects.all():
            competitor_id = competitor_id_by_slug.get(company.slug)
            if competitor_id is None:
                continue

            fields_to_update = []
            apar = apar_by_competitor.get(competitor_id)
            ofsted_provider = ofsted_provider_by_competitor.get(competitor_id)

            if not company.ukprn and apar and apar[0]:
                company.ukprn = apar[0]
                fields_to_update.append("ukprn")

            if not company.legal_name:
                legal_name = (apar[1] if apar else None) or (ofsted_provider[0] if ofsted_provider else None)
                if legal_name:
                    company.legal_name = legal_name[:255]
                    fields_to_update.append("legal_name")

            if not company.location and ofsted_provider:
                _, local_authority, region = ofsted_provider
                location = ", ".join(part for part in [local_authority, region] if part)
                if location:
                    company.location = location
                    fields_to_update.append("location")

            if company.ofsted_status == "Not Publicly Available":
                label = ofsted_label_by_competitor.get(competitor_id)
                if label:
                    company.ofsted_status = label
                    fields_to_update.append("ofsted_status")

            if fields_to_update:
                company.save(update_fields=fields_to_update)
                updated += 1

        self.stdout.write(self.style.SUCCESS(f"Enriched {updated} companies."))
