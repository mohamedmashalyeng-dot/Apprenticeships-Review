export interface CompetitorTargetStandardSummary {
  st_code: string;
  name: string;
  kbc_mapped: boolean;
  fatp_current: boolean;
}

export interface CompetitorSourceCoverage {
  trustpilot: boolean;
  fatp: boolean;
  apar: boolean;
  dfe_activity: boolean;
  dfe_qar: boolean;
  ofsted: boolean;
  google_place: boolean;
}

export interface CompetitorSummary {
  competitor_id: string;
  name: string;
  website_url: string;
  ukprn: string | null;
  target_standards: CompetitorTargetStandardSummary[];
  trustpilot_rating: number | null;
  trustpilot_review_count: number | null;
  fatp_achievement_rate: number | null;
  fatp_active_learners: number | null;
  fatp_standards_count: number;
  dfe_activity_period: string | null;
  dfe_activity_starts: number | null;
  qar_period: string | null;
  qar_achievement_rate: number | null;
  qar_retention_rate: number | null;
  qar_pass_rate: number | null;
  ofsted_framework_era: "legacy" | "renewed" | null;
  ofsted_label: string | null;
  source_coverage: CompetitorSourceCoverage;
}

export interface CompetitorAparProfile {
  ukprn: string;
  provider_name: string | null;
  application_type: string | null;
  delivers_apprenticeships: boolean | null;
  delivers_apprenticeship_units: boolean | null;
  start_date: string | null;
  status: string | null;
  application_determined_date: string | null;
  source_url: string | null;
  collected_at: string;
}

export interface CompetitorTargetProgramme {
  st_code: string;
  name: string;
  level: number;
  kbc_mapped: boolean;
  fatp_current: { title: string; level: string | null; url: string | null; max_funding: string | null } | null;
  qar: { period: string | null; achievement_rate: number | null } | null;
  skills_england: { status: string | null; approved_for_delivery_date: string | null } | null;
}

export interface CompetitorFatpMetric {
  value: number | null;
  count: number | null;
  captured_at: string;
}

export interface CompetitorFatpStandard {
  fatp_standard_title: string;
  standard_reference: string | null;
  level: string | null;
  standard_url: string | null;
  max_funding: string | null;
  is_current: boolean;
  first_seen_at: string;
  last_seen_at: string;
  removed_at: string | null;
}

export interface CompetitorReview {
  source_key: string;
  rating_value: number | null;
  rating_scale: number;
  title: string | null;
  review_text: string | null;
  review_date: string | null;
  is_verified: boolean | null;
  reviewer_name: string | null;
}

export interface CompetitorDfeActivityYear {
  time_period: string;
  period: string;
  starts: number | null;
  achievements: number | null;
  is_provisional: boolean;
}

export interface CompetitorQarYear {
  time_period: string;
  period: string;
  leavers: number | null;
  completers: number | null;
  achievers: number | null;
  retention_rate: number | null;
  pass_rate: number | null;
  achievement_rate: number | null;
}

export interface CompetitorQarLevelBreakdown {
  level_label: string;
  period: string;
  achievement_rate: number | null;
}

export interface CompetitorOfstedInspection {
  inspection_type: string;
  framework_era: "legacy" | "renewed";
  first_day_of_inspection: string | null;
  date_published: string | null;
  inspection_number: string;
  safeguarding: string | null;
  inclusion: string | null;
  leadership_governance: string | null;
  meeting_skills_needs: string | null;
  apprenticeships_curriculum_teaching_training: string | null;
  apprenticeships_achievement: string | null;
  apprenticeships_participation_development: string | null;
  legacy_overall_effectiveness_label: string | null;
  legacy_quality_of_education: string | null;
  legacy_behaviour_and_attitudes: string | null;
  legacy_personal_development: string | null;
  legacy_leadership_and_management: string | null;
  event_type: string | null;
}

export interface CompetitorOfstedStatus {
  has_renewed_full_inspection: boolean | null;
  has_new_provider_monitoring: boolean | null;
  latest_short_inspection_before_renewed: string | null;
  local_authority: string | null;
  region: string | null;
}

export interface CompetitorSourceRow {
  source_key: string;
  source_name: string;
  profile_url: string;
  approval_status: string;
  enabled: boolean;
  last_checked_at: string | null;
  last_status: string | null;
}

export interface CompetitorDetail {
  competitor_id: string;
  name: string;
  website_url: string;
  website_domain: string;
  updated_at: string;
  apar: CompetitorAparProfile | null;
  target_programmes: CompetitorTargetProgramme[];
  fatp: {
    metrics: Record<string, CompetitorFatpMetric>;
    standards: CompetitorFatpStandard[];
    reviews: CompetitorReview[];
  };
  trustpilot: {
    summary: { rating: number | null; review_count: number | null; captured_at: string } | null;
    reviews: CompetitorReview[];
  };
  dfe_activity: CompetitorDfeActivityYear[];
  dfe_qar: { by_year: CompetitorQarYear[]; by_level: CompetitorQarLevelBreakdown[] };
  ofsted: { inspections: CompetitorOfstedInspection[]; status: CompetitorOfstedStatus | null };
  google_place_id: string | null;
  sources: CompetitorSourceRow[];
}

export interface CompetitorLandscapeTargetCoverage {
  st_code: string;
  name: string;
  kbc_mapped_count: number;
  fatp_current_count: number;
  qar_evidence_count: number;
}

export interface CompetitorLandscapeSourceCoverage {
  trustpilot: number;
  fatp: number;
  apar: number;
  dfe_activity: number;
  dfe_qar: number;
  ofsted: number;
  google_place: number;
}

export interface CompetitorLandscapeOverview {
  total_competitors: number;
  target_standard_coverage: CompetitorLandscapeTargetCoverage[];
  source_coverage: CompetitorLandscapeSourceCoverage;
  fatp_standards_portfolio: { average: number | null; min: number | null; max: number | null };
  trustpilot_average_rating: number | null;
  trustpilot_total_reviews: number | null;
  fatp_average_achievement_rate: number | null;
  qar_average_achievement_rate: number | null;
  ofsted_renewed_distribution: Record<string, number>;
  ofsted_legacy_distribution: Record<string, number>;
}
