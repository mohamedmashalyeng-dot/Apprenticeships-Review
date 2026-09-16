import { api, getOrNull } from "@/lib/api/client";

export interface IngestionJob {
  id: string;
  status: "queued" | "running" | "completed" | "failed";
  file_name: string;
  reviews_found: number;
  reviews_added: number;
  reviews_updated: number;
  reviews_skipped: number;
  error_message: string;
  created_at: string;
}

export async function getImportJobs(): Promise<IngestionJob[]> {
  return api.get<IngestionJob[]>("/ingestion-jobs/");
}

export async function getIngestionJob(id: string): Promise<IngestionJob | null> {
  return getOrNull<IngestionJob>(`/ingestion-jobs/${id}/`);
}
