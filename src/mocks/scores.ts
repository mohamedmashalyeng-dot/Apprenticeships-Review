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

export const scores: ProviderScore[] = [
  {
    provider_id: "kent-business-college",
    learner_experience_score: 0,
    employer_satisfaction_score: 0,
    outcome_score: 0,
    quality_score: 0,
    confidence_score: 0,
    overall_score: 0,
    data_confidence_label: "Not Publicly Available",
  },
  {
    provider_id: "fareport",
    learner_experience_score: 0,
    employer_satisfaction_score: 0,
    outcome_score: 0,
    quality_score: 0,
    confidence_score: 0,
    overall_score: 0,
    data_confidence_label: "Not Publicly Available",
  },
  {
    provider_id: "oxford-professional",
    learner_experience_score: 0,
    employer_satisfaction_score: 0,
    outcome_score: 0,
    quality_score: 0,
    confidence_score: 0,
    overall_score: 0,
    data_confidence_label: "Not Publicly Available",
  },
  {
    provider_id: "london-met",
    learner_experience_score: 0,
    employer_satisfaction_score: 0,
    outcome_score: 0,
    quality_score: 0,
    confidence_score: 0,
    overall_score: 0,
    data_confidence_label: "Not Publicly Available",
  },
  {
    provider_id: "cambridge-marketing-college",
    learner_experience_score: 0,
    employer_satisfaction_score: 0,
    outcome_score: 0,
    quality_score: 0,
    confidence_score: 0,
    overall_score: 0,
    data_confidence_label: "Not Publicly Available",
  },
  {
    provider_id: "cambridge-professional-academy",
    learner_experience_score: 0,
    employer_satisfaction_score: 0,
    outcome_score: 0,
    quality_score: 0,
    confidence_score: 0,
    overall_score: 0,
    data_confidence_label: "Not Publicly Available",
  },
  {
    provider_id: "jga-group",
    learner_experience_score: 0,
    employer_satisfaction_score: 0,
    outcome_score: 0,
    quality_score: 0,
    confidence_score: 0,
    overall_score: 0,
    data_confidence_label: "Not Publicly Available",
  },
  {
    provider_id: "sccu",
    learner_experience_score: 0,
    employer_satisfaction_score: 0,
    outcome_score: 0,
    quality_score: 0,
    confidence_score: 0,
    overall_score: 0,
    data_confidence_label: "Not Publicly Available",
  },
  {
    provider_id: "university-cumbria",
    learner_experience_score: 0,
    employer_satisfaction_score: 0,
    outcome_score: 0,
    quality_score: 0,
    confidence_score: 0,
    overall_score: 0,
    data_confidence_label: "Not Publicly Available",
  },
];

export function getProviderScore(providerId: string): ProviderScore | undefined {
  return scores.find((s) => s.provider_id === providerId);
}

export const scoreWeights = {
  learner_experience: 30,
  employer_satisfaction: 25,
  outcome_evidence: 20,
  quality_evidence: 15,
  review_confidence: 10,
};