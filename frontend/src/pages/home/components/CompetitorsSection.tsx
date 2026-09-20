import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCompetitors } from "@/services/competitors.service";
import type { CompetitorSummary } from "@/types/competitor";

const PREVIEW_COUNT = 6;

function formatPercent(value: number | null): string {
  return value == null ? "Unavailable" : `${value.toFixed(1)}%`;
}

export default function CompetitorsSection({ active = true, onReady }: { active?: boolean; onReady?: () => void } = {}) {
  const [competitors, setCompetitors] = useState<CompetitorSummary[]>([]);

  useEffect(() => {
    if (!active) return;
    getCompetitors()
      .then((all) => {
        const ranked = [...all].sort((a, b) => {
          const ratingA = a.trustpilot_rating ?? -1;
          const ratingB = b.trustpilot_rating ?? -1;
          if (ratingB !== ratingA) return ratingB - ratingA;
          return (b.fatp_achievement_rate ?? -1) - (a.fatp_achievement_rate ?? -1);
        });
        setCompetitors(ranked.slice(0, PREVIEW_COUNT));
      })
      .catch(() => setCompetitors([]))
      .finally(() => onReady?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (competitors.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-background-50">
      <div className="w-full px-3 py-12 sm:px-4 md:px-6 md:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground-900 md:text-3xl">
                Provider data and inspection reports
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground-500 md:text-base">
                Explore published provider information alongside review feedback. Check the source, reporting period and update date for each measure.
              </p>
            </div>
            <Link
              to="/competitors"
              className="inline-flex items-center gap-2 self-start rounded-lg border border-background-200/70 bg-background-50 px-5 py-2.5 text-sm font-semibold text-primary-500 transition-all duration-200 hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-600 sm:self-auto"
            >
              Understand the data
              <i className="ri-arrow-right-line text-sm" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 px-1 sm:grid-cols-2 sm:px-0 md:gap-5 lg:grid-cols-3">
            {competitors.map((c) => (
              <Link
                key={c.competitor_id}
                to={`/competitors/${c.competitor_id}`}
                className="flex flex-col rounded-2xl border border-white/60 bg-white/75 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="line-clamp-2 font-heading text-base font-bold leading-snug text-foreground-900">{c.name}</h3>
                <p className="mt-0.5 text-sm text-foreground-400">
                  {c.ukprn ? `UKPRN ${c.ukprn}` : "Provider identity to confirm"}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-foreground-400">Trustpilot TrustScore</p>
                    <p className="text-sm font-semibold text-foreground-900">
                      {c.trustpilot_rating != null ? `${c.trustpilot_rating.toFixed(1)} out of 5` : "Unavailable"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-400">Apprenticeship achievement rate</p>
                    <p className="text-sm font-semibold text-foreground-900">{formatPercent(c.fatp_achievement_rate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-400">Ofsted report</p>
                    <p className="text-sm font-semibold text-foreground-900">{c.ofsted_label ?? "Report unavailable"}</p>
                  </div>
                </div>

                <span className="mt-auto pt-4 text-sm font-medium text-primary-600">
                  View source details <i className="ri-arrow-right-line text-[10px]" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
