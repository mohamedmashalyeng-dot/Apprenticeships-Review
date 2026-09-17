import { api } from "@/lib/api/client";

export type ClaimStatus = "pending" | "approved" | "rejected";

export interface CompanyClaim {
  id: string;
  company_slug: string | null;
  organisation_name: string;
  contact_name: string;
  email: string;
  role: string;
  website: string;
  verification_details: string;
  status: ClaimStatus;
  created_at: string;
}

export interface SubmitClaimInput {
  organisationName: string;
  contactName: string;
  email: string;
  role: string;
  website: string;
  verificationDetails?: string;
  companySlug?: string;
}

export async function submitClaim(input: SubmitClaimInput): Promise<CompanyClaim> {
  return api.post<CompanyClaim>("/company-claims/", {
    organisation_name: input.organisationName,
    contact_name: input.contactName,
    email: input.email,
    role: input.role,
    website: input.website,
    verification_details: input.verificationDetails ?? "",
    company_slug: input.companySlug ?? null,
  });
}

export async function getClaims(status?: ClaimStatus): Promise<CompanyClaim[]> {
  const qs = status ? `?status=${status}` : "";
  return api.get<CompanyClaim[]>(`/company-claims/${qs}`);
}

/** Approves the claim — creates the company if it doesn't exist yet and links the
 *  submitting user as its owner (sets their role to company_owner). */
export async function approveClaim(id: string): Promise<CompanyClaim> {
  return api.post<CompanyClaim>(`/company-claims/${id}/approve/`);
}

export async function rejectClaim(id: string): Promise<CompanyClaim> {
  return api.post<CompanyClaim>(`/company-claims/${id}/reject/`);
}
