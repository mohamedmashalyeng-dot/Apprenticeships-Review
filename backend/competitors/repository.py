"""Read-only data access for the KBC Competitor Intelligence tables.

These tables (competitors, competitor_*, skills_england_standards, ...) already exist in
this project's own Postgres database, populated by a separate collector system — this
module only ever SELECTs from them. Raw SQL is used deliberately instead of Django models:
most of these tables have no single-column primary key (junction tables, OneToOne-by-FK
tables), and the exact join/filter semantics here were validated by hand against the live
data (see the "is_overall" / "is_total_row" / "*_suppressed" flag notes below) rather than
being something an ORM mapping would make obviously correct.
"""

from django.db import connection

# Fixed identity of KBC's 4 target apprenticeship standards. Not derivable from the DB:
# `apprenticeship_programmes.standard_key` uses this app's own slug convention
# ("marketing-executive-l4"), while FATP/QAR/Skills England all key on the official ST
# reference — this is the (structural, non-numeric) mapping between the two.
TARGET_STANDARDS = [
    {"standard_key": "marketing-executive-l4", "st_code": "ST0596", "name": "Marketing Executive", "level": 4},
    {"standard_key": "marketing-manager-l6", "st_code": "ST0612", "name": "Marketing Manager", "level": 6},
    {"standard_key": "associate-project-manager-l4", "st_code": "ST0310", "name": "Associate Project Manager", "level": 4},
    {"standard_key": "project-controls-professional-l6", "st_code": "ST0845", "name": "Project Controls Professional", "level": 6},
]
TARGET_ST_CODES = [t["st_code"] for t in TARGET_STANDARDS]


def _dictfetchall(cur):
    cols = [c[0] for c in cur.description]
    return [dict(zip(cols, row)) for row in cur.fetchall()]


def _group_by(rows, key):
    out = {}
    for row in rows:
        out.setdefault(row[key], []).append(row)
    return out


def list_competitor_summaries():
    """One row per competitor (all 203), with the core comparison columns for the list page."""
    with connection.cursor() as cur:
        cur.execute("SELECT id, slug, name, website_url, website_domain FROM competitors WHERE enabled = true ORDER BY name")
        competitors = _dictfetchall(cur)
        ids = [c["id"] for c in competitors]
        if not ids:
            return []

        cur.execute("SELECT competitor_id, ukprn FROM competitor_apar_profiles WHERE competitor_id = ANY(%s)", [ids])
        ukprn_by_id = {r[0]: r[1] for r in cur.fetchall()}

        # Latest snapshot per (competitor, source_key, metric_key) — the view already picks
        # the most recent captured_at per source+metric, so this is one clean read.
        cur.execute(
            """
            SELECT competitor_id, source_key, metric_key, rating_value, review_count
            FROM latest_competitor_ratings
            WHERE competitor_id = ANY(%s)
            """,
            [ids],
        )
        ratings_by_id = _group_by(_dictfetchall(cur), "competitor_id")

        # One pass over current FATP standards gives both the per-competitor count and which
        # target ST codes they currently list (was 2 separate round trips over the same table).
        cur.execute(
            "SELECT competitor_id, standard_reference FROM competitor_fatp_standards WHERE is_current = true AND competitor_id = ANY(%s)",
            [ids],
        )
        fatp_standards_count: dict = {}
        fatp_target_codes: dict = {}
        target_code_set = set(TARGET_ST_CODES)
        for cid_row, standard_reference in cur.fetchall():
            fatp_standards_count[cid_row] = fatp_standards_count.get(cid_row, 0) + 1
            if standard_reference in target_code_set:
                fatp_target_codes.setdefault(cid_row, set()).add(standard_reference)

        cur.execute(
            "SELECT competitor_id, programme_id FROM competitor_apprenticeship_programmes WHERE active = true AND competitor_id = ANY(%s)",
            [ids],
        )
        kbc_links = _group_by([dict(zip(["competitor_id", "programme_id"], r)) for r in cur.fetchall()], "competitor_id")
        cur.execute("SELECT id, standard_key FROM apprenticeship_programmes")
        programme_key_by_id = {r[0]: r[1] for r in cur.fetchall()}

        # DfE Activity: latest FINAL (non-provisional) total row per competitor.
        cur.execute(
            """
            SELECT DISTINCT ON (competitor_id) competitor_id, time_period_label, starts
            FROM competitor_dfe_provider_activity
            WHERE is_total_row = true AND is_provisional = false AND competitor_id = ANY(%s)
            ORDER BY competitor_id, time_period DESC
            """,
            [ids],
        )
        dfe_activity_latest = {r[0]: {"period": r[1], "starts": r[2]} for r in cur.fetchall()}

        # DfE QAR: latest overall row per competitor (all published years are final; no
        # provisional flag on this table). Suppressed achievement_rate stays None, not 0.
        cur.execute(
            """
            SELECT DISTINCT ON (competitor_id)
                competitor_id, time_period_label, achievement_rate, achievement_rate_suppressed,
                retention_rate, pass_rate
            FROM competitor_dfe_qar
            WHERE is_overall = true AND competitor_id = ANY(%s)
            ORDER BY competitor_id, time_period DESC
            """,
            [ids],
        )
        qar_latest = {}
        for cid, period, ach, ach_sup, ret, pas in cur.fetchall():
            qar_latest[cid] = {
                "period": period,
                "achievement_rate": None if ach_sup else ach,
                "retention_rate": ret,
                "pass_rate": pas,
            }

        # Ofsted: prefer a renewed-framework apprenticeship outcome; fall back to the legacy label.
        cur.execute(
            """
            SELECT competitor_id, framework_era, legacy_overall_effectiveness_label, apprenticeships_achievement, date_published
            FROM competitor_ofsted_inspections
            WHERE competitor_id = ANY(%s)
            ORDER BY competitor_id, (framework_era = 'renewed') DESC, date_published DESC NULLS LAST
            """,
            [ids],
        )
        ofsted_latest = {}
        for cid, era, legacy_label, renewed_outcome, date_published in cur.fetchall():
            if cid in ofsted_latest:
                continue
            ofsted_latest[cid] = {
                "framework_era": era,
                "label": renewed_outcome if era == "renewed" else legacy_label,
                "date_published": date_published,
            }

        # One round trip (UNION ALL) instead of 5 separate "does this competitor have any row
        # in table X" queries.
        cur.execute(
            """
            SELECT DISTINCT 'has_apar' AS flag, competitor_id FROM competitor_apar_profiles WHERE competitor_id = ANY(%(ids)s)
            UNION ALL
            SELECT DISTINCT 'has_dfe_activity', competitor_id FROM competitor_dfe_provider_activity WHERE competitor_id = ANY(%(ids)s)
            UNION ALL
            SELECT DISTINCT 'has_dfe_qar', competitor_id FROM competitor_dfe_qar WHERE competitor_id = ANY(%(ids)s)
            UNION ALL
            SELECT DISTINCT 'has_ofsted', competitor_id FROM competitor_ofsted_inspections WHERE competitor_id = ANY(%(ids)s)
            UNION ALL
            SELECT DISTINCT 'has_google', competitor_id FROM google_place_candidates WHERE approval_status = 'approved' AND competitor_id = ANY(%(ids)s)
            """,
            {"ids": ids},
        )
        source_flags: dict = {}
        for flag, cid_row in cur.fetchall():
            source_flags.setdefault(flag, set()).add(cid_row)
        has_google = source_flags.get("has_google", set())

    def metric(cid, source_key, metric_key):
        for row in ratings_by_id.get(cid, []):
            if row["source_key"] == source_key and row["metric_key"] == metric_key:
                return row
        return None

    out = []
    for c in competitors:
        cid = c["id"]
        trustpilot = metric(cid, "trustpilot", "trustscore")
        fatp_achievement = metric(cid, "fatp", "fatp_achievement_rate")
        fatp_learners = metric(cid, "fatp", "fatp_active_learners")
        kbc_programme_ids = {r["programme_id"] for r in kbc_links.get(cid, [])}
        kbc_standard_keys = {programme_key_by_id.get(pid) for pid in kbc_programme_ids}
        target_coverage = [
            {
                "st_code": t["st_code"],
                "name": t["name"],
                "kbc_mapped": t["standard_key"] in kbc_standard_keys,
                "fatp_current": t["st_code"] in fatp_target_codes.get(cid, set()),
            }
            for t in TARGET_STANDARDS
        ]
        activity = dfe_activity_latest.get(cid)
        qar = qar_latest.get(cid)
        ofsted = ofsted_latest.get(cid)
        out.append(
            {
                "competitor_id": c["slug"],
                "name": c["name"],
                "website_url": c["website_url"],
                "ukprn": ukprn_by_id.get(cid),
                "target_standards": target_coverage,
                "trustpilot_rating": trustpilot["rating_value"] if trustpilot else None,
                "trustpilot_review_count": trustpilot["review_count"] if trustpilot else None,
                "fatp_achievement_rate": fatp_achievement["rating_value"] if fatp_achievement else None,
                "fatp_active_learners": fatp_learners["rating_value"] if fatp_learners else None,
                "fatp_standards_count": fatp_standards_count.get(cid, 0),
                "dfe_activity_period": activity["period"] if activity else None,
                "dfe_activity_starts": activity["starts"] if activity else None,
                "qar_period": qar["period"] if qar else None,
                "qar_achievement_rate": qar["achievement_rate"] if qar else None,
                "qar_retention_rate": qar["retention_rate"] if qar else None,
                "qar_pass_rate": qar["pass_rate"] if qar else None,
                "ofsted_framework_era": ofsted["framework_era"] if ofsted else None,
                "ofsted_label": ofsted["label"] if ofsted else None,
                "source_coverage": {
                    "trustpilot": trustpilot is not None,
                    "fatp": fatp_achievement is not None or fatp_standards_count.get(cid, 0) > 0,
                    "apar": cid in source_flags.get("has_apar", set()),
                    "dfe_activity": cid in source_flags.get("has_dfe_activity", set()),
                    "dfe_qar": cid in source_flags.get("has_dfe_qar", set()),
                    "ofsted": cid in source_flags.get("has_ofsted", set()),
                    "google_place": cid in has_google,
                },
            }
        )
    return out


def get_competitor_detail(slug):
    """Full detail payload for one competitor (sections A-K from the KBC spec)."""
    with connection.cursor() as cur:
        cur.execute(
            "SELECT id, slug, name, website_url, website_domain, updated_at FROM competitors WHERE slug = %s",
            [slug],
        )
        row = cur.fetchone()
        if row is None:
            return None
        cid, slug, name, website_url, website_domain, updated_at = row

        # A. Identity / APAR
        cur.execute(
            """
            SELECT ukprn, provider_name, application_type, delivers_apprenticeships,
                   delivers_apprenticeship_units, start_date, status, application_determined_date,
                   source_url, collected_at
            FROM competitor_apar_profiles WHERE competitor_id = %s
            """,
            [cid],
        )
        apar_row = cur.fetchone()
        apar = None
        if apar_row:
            apar = dict(zip(
                ["ukprn", "provider_name", "application_type", "delivers_apprenticeships",
                 "delivers_apprenticeship_units", "start_date", "status", "application_determined_date",
                 "source_url", "collected_at"],
                apar_row,
            ))

        # B/C/F. KBC target-programme evidence: KBC mapping + FATP current + QAR target rows + Skills England
        cur.execute(
            "SELECT programme_id FROM competitor_apprenticeship_programmes WHERE active = true AND competitor_id = %s",
            [cid],
        )
        kbc_programme_ids = {r[0] for r in cur.fetchall()}
        cur.execute("SELECT id, standard_key FROM apprenticeship_programmes")
        programme_key_by_id = {r[0]: r[1] for r in cur.fetchall()}
        kbc_standard_keys = {programme_key_by_id.get(pid) for pid in kbc_programme_ids}

        cur.execute(
            """
            SELECT standard_reference, fatp_standard_title, level, standard_url, max_funding
            FROM competitor_fatp_standards
            WHERE is_current = true AND standard_reference = ANY(%s) AND competitor_id = %s
            """,
            [TARGET_ST_CODES, cid],
        )
        fatp_target_rows = {
            r[0]: dict(zip(["title", "level", "url", "max_funding"], r[1:])) for r in cur.fetchall()
        }

        cur.execute(
            """
            SELECT DISTINCT ON (standard_code) standard_code, time_period_label, achievement_rate,
                   achievement_rate_suppressed
            FROM competitor_dfe_qar
            WHERE is_overall = false AND standard_code = ANY(%s) AND competitor_id = %s
            ORDER BY standard_code, time_period DESC
            """,
            [TARGET_ST_CODES, cid],
        )
        qar_target_rows = {}
        for code, period, rate, suppressed in cur.fetchall():
            qar_target_rows[code] = {"period": period, "achievement_rate": None if suppressed else rate}

        cur.execute(
            """
            SELECT DISTINCT ON (standard_reference) standard_reference, status, approved_for_delivery_date
            FROM skills_england_standards
            WHERE standard_reference = ANY(%s)
            ORDER BY standard_reference, collected_at DESC
            """,
            [TARGET_ST_CODES],
        )
        skills_england_by_code = {
            r[0]: {"status": r[1], "approved_for_delivery_date": r[2]} for r in cur.fetchall()
        }

        target_programmes = [
            {
                "st_code": t["st_code"],
                "name": t["name"],
                "level": t["level"],
                "kbc_mapped": t["standard_key"] in kbc_standard_keys,
                "fatp_current": fatp_target_rows.get(t["st_code"]),
                "qar": qar_target_rows.get(t["st_code"]),
                "skills_england": skills_england_by_code.get(t["st_code"]),
            }
            for t in TARGET_STANDARDS
        ]

        # C. FATP — latest metric snapshots + full current standards portfolio + written reviews
        cur.execute(
            """
            SELECT metric_key, rating_value, review_count, captured_at
            FROM latest_competitor_ratings
            WHERE competitor_id = %s AND source_key = 'fatp'
            """,
            [cid],
        )
        fatp_metrics = {r[0]: {"value": r[1], "count": r[2], "captured_at": r[3]} for r in cur.fetchall()}

        cur.execute(
            """
            SELECT fatp_standard_title, standard_reference, level, standard_url, max_funding, is_current,
                   first_seen_at, last_seen_at, removed_at
            FROM competitor_fatp_standards
            WHERE competitor_id = %s
            ORDER BY is_current DESC, fatp_standard_title
            """,
            [cid],
        )
        fatp_standards = _dictfetchall(cur)

        # D. Trustpilot — latest metric + stored written reviews
        cur.execute(
            "SELECT rating_value, review_count, captured_at FROM latest_competitor_ratings WHERE competitor_id = %s AND source_key = 'trustpilot'",
            [cid],
        )
        tp_row = cur.fetchone()
        trustpilot = {"rating": tp_row[0], "review_count": tp_row[1], "captured_at": tp_row[2]} if tp_row else None

        cur.execute(
            """
            SELECT rs.source_key, cr.rating_value, cr.rating_scale, cr.title, cr.review_text,
                   cr.review_date, cr.is_verified, cr.reviewer_name
            FROM competitor_reviews cr
            JOIN competitor_rating_sources rs ON rs.id = cr.rating_source_id
            WHERE cr.competitor_id = %s
            ORDER BY cr.review_date DESC NULLS LAST
            """,
            [cid],
        )
        all_reviews = _dictfetchall(cur)
        trustpilot_reviews = [r for r in all_reviews if r["source_key"] == "trustpilot"]
        fatp_reviews = [r for r in all_reviews if r["source_key"] == "fatp"]

        # E. DfE Activity — every year's total row, final and provisional both shown (labelled)
        cur.execute(
            """
            SELECT time_period, time_period_label, starts, starts_suppressed, achievements,
                   achievements_suppressed, is_provisional
            FROM competitor_dfe_provider_activity
            WHERE is_total_row = true AND competitor_id = %s
            ORDER BY time_period DESC
            """,
            [cid],
        )
        dfe_activity_years = [
            {
                "time_period": r[0],
                "period": r[1],
                "starts": None if r[3] else r[2],
                "achievements": None if r[5] else r[4],
                "is_provisional": r[6],
            }
            for r in cur.fetchall()
        ]

        # F. DfE QAR — overall row per year
        cur.execute(
            """
            SELECT time_period, time_period_label, leavers, leavers_suppressed, completers,
                   completers_suppressed, achievers, achievers_suppressed, retention_rate,
                   retention_rate_suppressed, pass_rate, pass_rate_suppressed, achievement_rate,
                   achievement_rate_suppressed
            FROM competitor_dfe_qar
            WHERE is_overall = true AND competitor_id = %s
            ORDER BY time_period DESC
            """,
            [cid],
        )
        qar_years = []
        for r in cur.fetchall():
            qar_years.append(
                {
                    "time_period": r[0],
                    "period": r[1],
                    "leavers": None if r[3] else r[2],
                    "completers": None if r[5] else r[4],
                    "achievers": None if r[7] else r[6],
                    "retention_rate": None if r[9] else r[8],
                    "pass_rate": None if r[11] else r[10],
                    "achievement_rate": None if r[13] else r[12],
                }
            )

        # F (continued) — level breakdown: overall-by-level rows (source's own labels, not renumbered)
        cur.execute(
            """
            SELECT DISTINCT ON (apprenticeship_level) apprenticeship_level, time_period_label,
                   achievement_rate, achievement_rate_suppressed
            FROM competitor_dfe_qar
            WHERE competitor_id = %s AND ssa_tier_1 = 'Total' AND std_fwk_name_stcode = 'Total'
                  AND age_youth_adult = 'Total' AND age_group = 'Total' AND apprenticeship_level <> 'Total'
            ORDER BY apprenticeship_level, time_period DESC
            """,
            [cid],
        )
        qar_level_breakdown = [
            {"level_label": r[0], "period": r[1], "achievement_rate": None if r[3] else r[2]}
            for r in cur.fetchall()
        ]

        # G. Ofsted — renewed and legacy inspections kept separate, plus provider status facts
        cur.execute(
            """
            SELECT inspection_type, framework_era, first_day_of_inspection, date_published,
                   inspection_number, safeguarding, inclusion, leadership_governance,
                   meeting_skills_needs, apprenticeships_curriculum_teaching_training,
                   apprenticeships_achievement, apprenticeships_participation_development,
                   legacy_overall_effectiveness_label, legacy_quality_of_education,
                   legacy_behaviour_and_attitudes, legacy_personal_development,
                   legacy_leadership_and_management, event_type
            FROM competitor_ofsted_inspections
            WHERE competitor_id = %s
            ORDER BY date_published DESC NULLS LAST
            """,
            [cid],
        )
        ofsted_inspections = _dictfetchall(cur)

        cur.execute(
            """
            SELECT has_renewed_full_inspection, has_new_provider_monitoring,
                   latest_short_inspection_before_renewed, local_authority, region
            FROM competitor_ofsted_provider_status WHERE competitor_id = %s
            """,
            [cid],
        )
        status_row = cur.fetchone()
        ofsted_status = (
            dict(zip(
                ["has_renewed_full_inspection", "has_new_provider_monitoring",
                 "latest_short_inspection_before_renewed", "local_authority", "region"],
                status_row,
            ))
            if status_row
            else None
        )

        # K. Source metadata
        cur.execute(
            """
            SELECT source_key, source_name, profile_url, approval_status, enabled, last_checked_at, last_status
            FROM competitor_rating_sources WHERE competitor_id = %s ORDER BY source_key
            """,
            [cid],
        )
        sources = _dictfetchall(cur)

        cur.execute(
            "SELECT place_id, approval_status FROM google_place_candidates WHERE competitor_id = %s AND approval_status = 'approved'",
            [cid],
        )
        google_row = cur.fetchone()

    return {
        "competitor_id": slug,
        "name": name,
        "website_url": website_url,
        "website_domain": website_domain,
        "updated_at": updated_at,
        "apar": apar,
        "target_programmes": target_programmes,
        "fatp": {"metrics": fatp_metrics, "standards": fatp_standards, "reviews": fatp_reviews},
        "trustpilot": {"summary": trustpilot, "reviews": trustpilot_reviews},
        "dfe_activity": dfe_activity_years,
        "dfe_qar": {"by_year": qar_years, "by_level": qar_level_breakdown},
        "ofsted": {"inspections": ofsted_inspections, "status": ofsted_status},
        "google_place_id": google_row[0] if google_row else None,
        "sources": sources,
    }
