import { api, apiFetch, getOrNull, buildQueryString } from "@/lib/api/client";
import type { Provider } from "@/types/provider";

export interface CompanyFilters {
  search?: string;
  location?: string;
  categoryId?: string; // categories.category_id slug
  level?: number;
  minRating?: number;
  sortBy?: "rating" | "reviews" | "name";
  minReviewCount?: number;
}

export interface NewCompanyInput {
  slug: string;
  trading_name: string;
  legal_name?: string;
  ukprn?: string;
  website?: string;
  location?: string;
  ofsted_status?: string;
  delivery_model?: string;
  description?: string;
  strengths?: string[];
  weaknesses?: string[];
  best_for?: string[];
  logo_url?: string;
}

function buildQuery(filters: CompanyFilters): string {
  return buildQueryString({
    search: filters.search,
    location: filters.location,
    category: filters.categoryId,
    level: filters.level,
    min_rating: filters.minRating,
    min_review_count: filters.minReviewCount,
    sort_by: filters.sortBy,
  });
}

export async function getCompanies(filters: CompanyFilters = {}, signal?: AbortSignal): Promise<Provider[]> {
  return apiFetch<Provider[]>(`/companies/${buildQuery(filters)}`, { signal });
}

export async function getCompanyBySlug(slug: string): Promise<Provider | null> {
  return getOrNull<Provider>(`/companies/${slug}/`);
}

export async function createCompany(input: NewCompanyInput): Promise<Provider> {
  return api.post<Provider>("/companies/", input);
}

/** Maps our snake_case field names to the wire names CompanySerializer actually expects
 *  (UKPRN, Ofsted_status, logoUrl) — a plain pass-through here would be silently dropped. */
export async function updateCompany(slug: string, patch: Partial<NewCompanyInput>): Promise<Provider> {
  const { ukprn, ofsted_status, logo_url, ...rest } = patch;
  const body: Record<string, unknown> = { ...rest };
  if (ukprn !== undefined) body.UKPRN = ukprn;
  if (ofsted_status !== undefined) body.Ofsted_status = ofsted_status;
  if (logo_url !== undefined) body.logoUrl = logo_url;
  return api.patch<Provider>(`/companies/${slug}/`, body);
}

export async function archiveCompany(slug: string): Promise<void> {
  await api.post(`/companies/${slug}/archive/`);
}

export async function getPlatformStats(): Promise<{
  totalCompanies: number;
  totalReviews: number;
  averageRating: number;
  learnerReviews: number;
  employerReviews: number;
}> {
  return api.get("/platform-stats/");
}
