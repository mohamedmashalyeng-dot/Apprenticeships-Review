import { api, getOrNull, buildQueryString } from "@/lib/api/client";
import type { Review } from "@/types/review";
import type { ProviderResponse } from "@/types/rating";

export interface SubmitReviewInput {
  // Exactly one of these two — companySlug for an existing provider, pendingClaimId when
  // submitting alongside a brand-new provider request that hasn't been approved yet.
  companySlug?: string;
  pendingClaimId?: string;
  standardSlug?: string;
  reviewerType: "learner" | "employer";
  rating: number;
  reviewTitle: string;
  reviewText: string;
  reviewTags?: string[];
  programmeStudied?: string;
  employerType?: string;
  wouldRecommend?: boolean;
  completionStatus?: "currently-enrolled" | "completed" | "withdrawn";
  categoryRatings?: Record<string, number>;
}

export interface ReviewListFilters {
  rating?: number;
  sourceKey?: string;
  sortBy?: "newest" | "oldest" | "highest" | "lowest";
  page?: number;
  limit?: number;
}

export interface PaginatedReviews {
  reviews: Review[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function buildFilterQuery(filters: Record<string, string | number | undefined>): string {
  const withoutAll = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "all"));
  return buildQueryString(withoutAll);
}

/** Splits a review list by who wrote it — used both server-side (below) and by pages that
 *  already have a fetched list and just need it grouped. */
export function splitByReviewerType(reviews: Review[]): { learner: Review[]; employer: Review[] } {
  return {
    learner: reviews.filter((r) => r.reviewer_type === "learner"),
    employer: reviews.filter((r) => r.reviewer_type === "employer"),
  };
}

export async function getCompanyReviews(companySlug: string): Promise<{ learner: Review[]; employer: Review[] }> {
  const { reviews } = await getReviews({ limit: 200 }, { company: companySlug });
  return splitByReviewerType(reviews);
}

export async function getReviewById(reviewId: string, opts: { includeUnapproved?: boolean } = {}): Promise<Review | null> {
  const qs = opts.includeUnapproved ? "?moderation_status=all" : "";
  return getOrNull<Review>(`/reviews/${reviewId}/${qs}`);
}

export async function getProviderResponseForReview(reviewId: string): Promise<ProviderResponse | null> {
  return api.get<ProviderResponse | null>(`/reviews/${reviewId}/response/`);
}

/** Server-side paginated/filterable review listing. Default page size 20. */
export async function getReviews(
  filters: ReviewListFilters = {},
  extra: Record<string, string | undefined> = {}
): Promise<PaginatedReviews> {
  const qs = buildFilterQuery({
    rating: filters.rating,
    source: filters.sourceKey,
    sort_by: filters.sortBy,
    page: filters.page,
    limit: filters.limit,
    ...extra,
  });
  return api.get<PaginatedReviews>(`/reviews/${qs}`);
}

export async function getReviewsBySource(sourceKey: string): Promise<Review[]> {
  const { reviews } = await getReviews({ sourceKey, limit: 200 });
  return reviews;
}

export async function getMyReviews(): Promise<Review[]> {
  const { reviews } = await getReviews({ limit: 200 }, { mine: "true" });
  return reviews;
}

export interface UpdateReviewInput {
  rating: number;
  reviewTitle: string;
  reviewText: string;
  reviewTags?: string[];
  wouldRecommend?: boolean;
  completionStatus?: "currently-enrolled" | "completed" | "withdrawn";
  categoryRatings?: Record<string, number>;
}

/** Only works while the review is still pending — matches the backend's own rule that a
 *  review can no longer be edited once it's been moderated. */
export async function updateReview(reviewId: string, input: UpdateReviewInput): Promise<Review> {
  return api.patch<Review>(`/reviews/${reviewId}/`, {
    rating: input.rating,
    review_title: input.reviewTitle,
    review_text: input.reviewText,
    review_tags: input.reviewTags ?? [],
    would_recommend: input.wouldRecommend ?? null,
    completion_status: input.completionStatus ?? null,
    category_ratings: input.categoryRatings ?? {},
  });
}

export async function submitReview(input: SubmitReviewInput): Promise<Review> {
  return api.post<Review>("/reviews/", {
    company_slug: input.companySlug,
    pending_claim_id: input.pendingClaimId,
    standard_slug: input.standardSlug,
    reviewer_type: input.reviewerType,
    rating: input.rating,
    review_title: input.reviewTitle,
    review_text: input.reviewText,
    review_tags: input.reviewTags ?? [],
    programme_studied: input.programmeStudied ?? "",
    employer_type: input.employerType ?? "",
    would_recommend: input.wouldRecommend ?? null,
    completion_status: input.completionStatus ?? null,
    category_ratings: input.categoryRatings ?? {},
  });
}

export async function updateReviewResponse(
  reviewId: string,
  response: { text: string; by: string; role: string }
): Promise<void> {
  await api.patch(`/reviews/${reviewId}/respond/`, {
    text: response.text,
    responder: response.by,
    role: response.role,
  });
}

export async function incrementHelpful(reviewId: string, delta: 1 | -1): Promise<number> {
  const data = await api.post<{ helpful_count: number }>(`/reviews/${reviewId}/helpful/`, { delta });
  return data.helpful_count;
}

// ───────────────────────── admin moderation ─────────────────────────

export interface AdminReviewFilters {
  companySlug?: string;
  sourceKey?: string;
  moderationStatus?: "pending" | "approved" | "rejected" | "flagged" | "all";
  rating?: number;
  page?: number;
  limit?: number;
}

/** Admin-only: unlike the public listing helpers above, this defaults to every moderation
 *  status (not just approved) since it's only ever called from the moderation dashboard. */
export async function getReviewsForModeration(filters: AdminReviewFilters = {}): Promise<PaginatedReviews> {
  return getReviews(
    { rating: filters.rating, sourceKey: filters.sourceKey, page: filters.page, limit: filters.limit, sortBy: "newest" },
    { company: filters.companySlug, moderation_status: filters.moderationStatus ?? "all" }
  );
}

export async function moderateReview(reviewId: string, status: "approved" | "rejected" | "flagged"): Promise<void> {
  await api.patch(`/reviews/${reviewId}/moderate/`, { moderation_status: status });
}

export async function deleteReview(reviewId: string): Promise<void> {
  await api.delete(`/reviews/${reviewId}/`);
}
