import { api } from "@/lib/api/client";

export interface ReviewSource {
  source_key: string;
  display_name: string;
  website_url: string;
  is_external_api: boolean;
}

export interface CompanySource {
  source_key: string;
  display_name: string;
  external_id: string;
  external_url: string;
  enabled: boolean;
}

export async function getReviewSources(): Promise<ReviewSource[]> {
  return api.get<ReviewSource[]>("/review-sources/");
}

export async function getCompanySources(companySlug: string): Promise<CompanySource[]> {
  return api.get<CompanySource[]>(`/companies/${companySlug}/sources/`);
}

export interface UpsertCompanySourceInput {
  companySlug: string;
  sourceKey: string;
  externalId?: string;
  externalUrl?: string;
  enabled?: boolean;
}

export async function upsertCompanySource(input: UpsertCompanySourceInput): Promise<void> {
  await api.patch(`/companies/${input.companySlug}/sources/${input.sourceKey}/`, {
    external_id: input.externalId ?? "",
    external_url: input.externalUrl ?? "",
    enabled: input.enabled ?? true,
  });
}
