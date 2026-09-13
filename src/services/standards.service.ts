import { api, getOrNull } from "@/lib/api/client";
import type { FAQItem, Standard } from "@/types/standard";
import type { ProviderStandardLink } from "@/types/provider";

export async function getStandards(): Promise<Standard[]> {
  return api.get<Standard[]>("/standards/");
}

export async function getStandardBySlug(standardSlug: string): Promise<Standard | null> {
  return getOrNull<Standard>(`/standards/${standardSlug}/`);
}

export async function getStandardFAQs(standardSlug: string): Promise<FAQItem[]> {
  return api.get<FAQItem[]>(`/standards/${standardSlug}/faqs/`);
}

/** Maps to the mock's getProviderStandards(providerId) — companySlug here is the company slug. */
export async function getCompanyStandards(companySlug: string): Promise<ProviderStandardLink[]> {
  return api.get<ProviderStandardLink[]>(`/companies/${companySlug}/standards/`);
}

/**
 * Bulk equivalent of getCompanyStandards for every company at once — one request instead of
 * one per company. Use this whenever you need standard links for many/all companies (e.g. a
 * picker grid showing every provider's standard count) rather than looping getCompanyStandards.
 */
export async function getAllCompanyStandards(): Promise<ProviderStandardLink[]> {
  return api.get<ProviderStandardLink[]>("/companies/all-standards/");
}

/** Maps to the mock's getStandardProviders(standardId) — returns the company slugs linked to a standard. */
export async function getStandardCompanySlugs(standardSlug: string): Promise<string[]> {
  const links = await api.get<ProviderStandardLink[]>(`/standards/${standardSlug}/providers/`);
  return links.map((l) => l.provider_id);
}

/** Joins a provider's standard links against the full standard list, dropping any link whose
 *  standard isn't found. Centralizes the by-standard_id lookup so callers don't each re-derive it. */
export function resolveStandards(
  links: ProviderStandardLink[],
  allStandards: Standard[]
): (ProviderStandardLink & { standard: Standard })[] {
  const byId = new Map(allStandards.map((s) => [s.standard_id, s]));
  return links
    .map((link) => {
      const standard = byId.get(link.standard_id);
      return standard ? { ...link, standard } : null;
    })
    .filter((x): x is ProviderStandardLink & { standard: Standard } => x !== null);
}
