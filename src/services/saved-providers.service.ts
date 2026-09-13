import { api } from "@/lib/api/client";

export async function getSavedProviderIds(): Promise<string[]> {
  const saved = await api.get<{ provider_id: string; created_at: string }[]>("/saved-providers/");
  return saved.map((s) => s.provider_id);
}

export async function saveProvider(providerId: string): Promise<void> {
  await api.post("/saved-providers/", { provider_id: providerId });
}

export async function unsaveProvider(providerId: string): Promise<void> {
  await api.delete(`/saved-providers/${providerId}/`);
}
