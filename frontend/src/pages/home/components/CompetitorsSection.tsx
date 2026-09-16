import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCompetitors } from "@/services/competitors.service";
import type { CompetitorSummary } from "@/types/competitor";

const PREVIEW_COUNT = 6;

function formatPercent(value: number | null): string {
  return value == null ? "—" : `${value.toFixed(1)}%`;
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
    <section className="relative w-full bg-background-50 overflow-hidden">
      <div className="w-full px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 md:mb-10 gap-4">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-900 tracking-tight">
                Provider Intelligence
              </h2>
              <p className="mt-2 text-sm md:text-base text-foreground-500 max-w-md leading-relaxed">
                Independent data on UK apprenticeship providers, sourced from Trustpilot, Find a Training
                Provider, DfE achievement data and Ofsted.
              </p>
            </div>
            <Link
              to="/competitors"
              className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 bg-background-50 border border-background-200/70 text-sm font-semibold text-primary-500 rounded-full hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-600 transition-all duration-200 whitespace-nowrap"
            >
              Read more
              <i className="ri-arrow-right-line text-sm" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {competitors.map((c) => (
              <Link
                key={c.competitor_id}
                to={`/competitors/${c.competitor_id}`}
                className="flex flex-col p-5 bg-background-50 border border-background-200/70 rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="font-heading text-base font-bold text-foreground-900 leading-snug line-clamp-2">
                  {c.name}
                </h3>
                <p className="text-xs text-foreground-400 mt-0.5">{c.ukprn ? `UKPRN ${c.ukprn}` : "UK provider"}</p>

                <div className="mt-4 flex items-center gap-4">
                  <div>
                    <p className="text-xs text-foreground-400">Trustpilot</p>
                    <p className="text-sm font-semibold text-foreground-900">
                      {c.trustpilot_rating != null ? (
                        <>
                          {c.trustpilot_rating.toFixed(1)} <i className="ri-star-fill text-primary-500 text-xs" />
                        </>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-400">FATP achievement</p>
                    <p className="text-sm font-semibold text-foreground-900">{formatPercent(c.fatp_achievement_rate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-400">Ofsted</p>
                    <p className="text-sm font-semibold text-foreground-900">{c.ofsted_label ?? "—"}</p>
                  </div>
                </div>

                <span className="mt-auto pt-4 text-xs font-medium text-primary-600">
                  View provider intelligence <i className="ri-arrow-right-line text-[10px]" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
