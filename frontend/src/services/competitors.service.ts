import { api } from "@/lib/api/client";
import type { CompetitorDetail, CompetitorLandscapeOverview, CompetitorSummary } from "@/types/competitor";

export async function getCompetitors(): Promise<CompetitorSummary[]> {
  return api.get("/competitors/");
}

export async function getCompetitor(slug: string): Promise<CompetitorDetail> {
  return api.get(`/competitors/${slug}/`);
}

export async function getCompetitorLandscape(): Promise<CompetitorLandscapeOverview> {
  return api.get("/competitors/overview/");
}
