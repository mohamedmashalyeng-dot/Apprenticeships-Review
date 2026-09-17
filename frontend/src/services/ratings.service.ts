import { api, getOrNull } from "@/lib/api/client";
import type { ProviderRating, RatingCategory } from "@/types/rating";
import type { ProviderScore } from "@/types/provider";

export async function getRatingCategories(): Promise<RatingCategory[]> {
  return api.get<RatingCategory[]>("/rating-categories/");
}

function emptyProviderRating(companySlug: string): ProviderRating {
  return {
    provider_id: companySlug,
    overall: 0,
    review_count: 0,
    recommendation_percent: null,
    categories: {},
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };
}

export async function getCompanyStats(companySlug: string): Promise<ProviderRating> {
  const stats = await getOrNull<ProviderRating>(`/companies/${companySlug}/rating-summary/`);
  return stats ?? emptyProviderRating(companySlug);
}

/**
 * ProviderScore (learner_experience_score etc.) is a zeroed placeholder returned as-is by the
 * API — real evidence scoring (public outcome data, Ofsted-weighted, etc.) is a future project.
 */
export async function getCompanyScore(companySlug: string): Promise<ProviderScore> {
  return api.get<ProviderScore>(`/companies/${companySlug}/score/`);
}
