export const providerLogoOverrides: Record<string, string> = {
  "apprentify": "https://icons.duckduckgo.com/ip3/apprentify.com.ico",
  "lift-schools": "https://cdn.prod.website-files.com/668f964276953a8d446956f4/66d1b773f3c61b3747b91000_L1.png",
};

export function getProviderLogoOverride(providerId: string): string | undefined {
  return providerLogoOverrides[providerId];
}
