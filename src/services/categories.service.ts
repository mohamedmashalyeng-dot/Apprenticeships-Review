import { api } from "@/lib/api/client";
import type { ApprenticeshipCategory } from "@/types/category";

export async function getCategories(): Promise<ApprenticeshipCategory[]> {
  return api.get<ApprenticeshipCategory[]>("/categories/");
}
