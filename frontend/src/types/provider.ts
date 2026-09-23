export interface Provider {
  provider_id: string;
  trading_name: string;
  legal_name: string;
  UKPRN: string;
  website: string;
  location: string;
  locationUrl?: string;
  Ofsted_status: string;
  verification_status: string;
  data_last_updated: string;
  delivery_model: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  best_for: string[];
  logoUrl?: string;
  average_rating: number;
  total_reviews: number;
  category_names: string[];
  levels: number[];
  recommendation_percent: number | null;
}

export interface ProviderStandardLink {
  provider_id: string;
  standard_id: string;
  delivery_status: string;
  evidence_source: string;
}

export interface ProviderScore {
  provider_id: string;
  learner_experience_score: number;
  employer_satisfaction_score: number;
  outcome_score: number;
  quality_score: number;
  confidence_score: number;
  overall_score: number;
  data_confidence_label: string;
}
