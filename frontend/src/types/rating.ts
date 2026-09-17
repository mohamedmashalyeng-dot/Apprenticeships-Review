export interface RatingCategory {
  key: string;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
}

export interface ProviderRating {
  provider_id: string;
  overall: number;
  review_count: number;
  recommendation_percent: number | null;
  categories: Record<string, number>;
  distribution: Record<number, number>;
}

export interface ProviderResponse {
  review_id: string;
  provider_id: string;
  responder: string;
  role: string;
  date: string;
  text: string;
}
