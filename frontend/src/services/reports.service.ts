import { api } from "@/lib/api/client";

export type ReportReason = "fake" | "offensive" | "personal" | "conflict" | "spam" | "other";
export type ReportStatus = "open" | "resolved" | "dismissed";

export interface ReviewReport {
  id: string;
  review_id: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  created_at: string;
}

export interface SubmitReportInput {
  reviewId: string;
  reason: ReportReason;
  details?: string;
}

export async function submitReport(input: SubmitReportInput): Promise<ReviewReport> {
  return api.post<ReviewReport>("/review-reports/", {
    review_id: input.reviewId,
    reason: input.reason,
    details: input.details ?? "",
  });
}

export async function getReports(status?: ReportStatus): Promise<ReviewReport[]> {
  const qs = status ? `?status=${status}` : "";
  return api.get<ReviewReport[]>(`/review-reports/${qs}`);
}

export async function resolveReport(id: string): Promise<ReviewReport> {
  return api.post<ReviewReport>(`/review-reports/${id}/resolve/`);
}

export async function dismissReport(id: string): Promise<ReviewReport> {
  return api.post<ReviewReport>(`/review-reports/${id}/dismiss/`);
}
