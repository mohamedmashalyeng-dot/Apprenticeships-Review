export interface Review {
  review_id: string;
  provider_id: string;
  standard_id: string;
  reviewer_type: "learner" | "employer";
  reviewer_name?: string;
  rating: number;
  review_title: string;
  review_text: string;
  verification_status: string;
  moderation_status?: "pending" | "approved" | "rejected" | "flagged";
  review_tags: string[];
  programme_studied?: string;
  employer_type?: string;
  would_recommend?: boolean;
  review_date: string;
  helpful_count?: number;
  category_ratings?: Record<string, number>;
  response_text?: string;
  response_by?: string;
  response_role?: string;
  response_date?: string;
}
