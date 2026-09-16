export interface Standard {
  standard_id: string;
  standard_name: string;
  level: number;
  sector: string;
  description: string;
  who_for: string;
  typical_learner: string;
  typical_employer: string;
  duration: string;
  max_funding: string;
  has_landing_page?: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}
