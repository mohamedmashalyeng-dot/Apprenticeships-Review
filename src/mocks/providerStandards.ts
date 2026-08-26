export interface ProviderStandardLink {
  provider_id: string;
  standard_id: string;
  delivery_status: string;
  evidence_source: string;
}

export const providerStandards: ProviderStandardLink[] = [
  { provider_id: "kent-business-college", standard_id: "marketing-executive-level-4", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "kent-business-college", standard_id: "marketing-manager-level-6", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "kent-business-college", standard_id: "associate-project-manager-level-4", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "kent-business-college", standard_id: "digital-marketer-level-3", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "fareport", standard_id: "marketing-executive-level-4", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "fareport", standard_id: "associate-project-manager-level-4", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "fareport", standard_id: "business-administrator-level-3", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "oxford-professional", standard_id: "marketing-executive-level-4", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "oxford-professional", standard_id: "marketing-manager-level-6", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "oxford-professional", standard_id: "associate-project-manager-level-4", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "oxford-professional", standard_id: "operations-manager-level-5", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "london-met", standard_id: "marketing-executive-level-4", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "london-met", standard_id: "associate-project-manager-level-4", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "london-met", standard_id: "project-controls-professional-level-6", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "cambridge-marketing-college", standard_id: "marketing-executive-level-4", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "cambridge-marketing-college", standard_id: "marketing-manager-level-6", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "cambridge-marketing-college", standard_id: "digital-marketer-level-3", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "cambridge-professional-academy", standard_id: "marketing-executive-level-4", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "cambridge-professional-academy", standard_id: "marketing-manager-level-6", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "jga-group", standard_id: "marketing-executive-level-4", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "jga-group", standard_id: "associate-project-manager-level-4", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "jga-group", standard_id: "business-administrator-level-3", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "sccu", standard_id: "marketing-executive-level-4", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "sccu", standard_id: "digital-marketer-level-3", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "university-cumbria", standard_id: "marketing-manager-level-6", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "university-cumbria", standard_id: "project-controls-professional-level-6", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
  { provider_id: "university-cumbria", standard_id: "operations-manager-level-5", delivery_status: "Active", evidence_source: "Register of Apprenticeship Training Providers" },
];

export function getProviderStandards(providerId: string): ProviderStandardLink[] {
  return providerStandards.filter((ps) => ps.provider_id === providerId);
}

export function getStandardProviders(standardId: string): ProviderStandardLink[] {
  return providerStandards.filter((ps) => ps.standard_id === standardId);
}