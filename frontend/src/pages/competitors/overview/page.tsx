import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import LoadingIndicator from "@/components/base/LoadingIndicator";
import { getCompetitorLandscape } from "@/services/competitors.service";
import type { CompetitorLandscapeOverview } from "@/types/competitor";

function pct(count: number, total: number): string {
  return total === 0 ? "0%" : `${Math.round((count / total) * 100)}%`;
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-background-50 border border-background-200/70 rounded-2xl p-5 md:p-6">
      <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground-900 mb-4">
        <i className={`${icon} text-primary-500`} />
        {title}
      </h2>
      {children}
    </div>
  );
}

function CoverageBar({ label, count, total }: { label: string; count: number; total: number }) {
  const percent = total === 0 ? 0 : (count / total) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-foreground-800">{label}</span>
        <span className="text-sm text-foreground-500">
          {count} / {total} <span className="text-foreground-400">({pct(count, total)})</span>
        </span>
      </div>
      <div className="h-2 bg-background-100 rounded-full overflow-hidden">
        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function DistributionList({ distribution }: { distribution: Record<string, number> }) {
  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, n]) => sum + n, 0);
  if (entries.length === 0) return <p className="text-sm text-foreground-500">No data.</p>;
  return (
    <div className="flex flex-col gap-2.5">
      {entries.map(([label, count]) => (
        <CoverageBar key={label} label={label} count={count} total={total} />
      ))}
    </div>
  );
}

export default function CompetitorLandscapeOverviewPage() {
  const [data, setData] = useState<CompetitorLandscapeOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCompetitorLandscape()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      <section className="w-full bg-background-50 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-10">
          <div className="max-w-6xl mx-auto">
            <Link to="/competitors" className="text-xs text-foreground-500 hover:text-primary-600">
              &larr; Provider Intelligence
            </Link>
            <h1 className="mt-2 font-heading text-2xl md:text-3xl font-bold text-foreground-950">
              Landscape Overview
            </h1>
            <p className="mt-2 text-sm text-foreground-600">
              Aggregate view across every tracked provider — coverage, portfolio size and performance
              distributions. No individual providers are ranked here.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full px-4 md:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {isLoading ? (
            <div className="py-16">
              <LoadingIndicator />
            </div>
          ) : error || !data ? (
            <div className="p-10 bg-background-100 rounded-2xl text-center text-sm text-foreground-500">
              Couldn&apos;t load the overview.
            </div>
          ) : (
            <>
              {/* Top stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-background-50 border border-background-200/70 rounded-2xl text-center">
                  <p className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">
                    {data.total_competitors}
                  </p>
                  <p className="text-xs text-foreground-500 mt-1">Providers tracked</p>
                </div>
                <div className="p-4 bg-background-50 border border-background-200/70 rounded-2xl text-center">
                  <p className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">
                    {data.trustpilot_average_rating != null ? data.trustpilot_average_rating.toFixed(1) : "—"}
                  </p>
                  <p className="text-xs text-foreground-500 mt-1">
                    Avg Trustpilot rating{data.trustpilot_total_reviews != null && ` (${data.trustpilot_total_reviews.toLocaleString()} reviews)`}
                  </p>
                </div>
                <div className="p-4 bg-background-50 border border-background-200/70 rounded-2xl text-center">
                  <p className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">
                    {data.fatp_average_achievement_rate != null ? `${data.fatp_average_achievement_rate.toFixed(1)}%` : "—"}
                  </p>
                  <p className="text-xs text-foreground-500 mt-1">Avg FATP achievement rate</p>
                </div>
                <div className="p-4 bg-background-50 border border-background-200/70 rounded-2xl text-center">
                  <p className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">
                    {data.qar_average_achievement_rate != null ? `${data.qar_average_achievement_rate.toFixed(1)}%` : "—"}
                  </p>
                  <p className="text-xs text-foreground-500 mt-1">Avg QAR achievement rate</p>
                </div>
              </div>

              {/* Target standard coverage */}
              <SectionCard title="KBC Target Standard Coverage" icon="ri-flag-line">
                <div className="flex flex-col gap-5">
                  {data.target_standard_coverage.map((t) => (
                    <div key={t.st_code}>
                      <p className="text-sm font-semibold text-foreground-900 mb-2">
                        {t.st_code} · {t.name}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <CoverageBar label="KBC mapped" count={t.kbc_mapped_count} total={data.total_competitors} />
                        <CoverageBar label="FATP currently lists" count={t.fatp_current_count} total={data.total_competitors} />
                        <CoverageBar label="DfE QAR evidence" count={t.qar_evidence_count} total={data.total_competitors} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Source coverage */}
              <SectionCard title="Source Coverage" icon="ri-database-2-line">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  <CoverageBar label="Trustpilot" count={data.source_coverage.trustpilot} total={data.total_competitors} />
                  <CoverageBar label="FATP" count={data.source_coverage.fatp} total={data.total_competitors} />
                  <CoverageBar label="APAR registration" count={data.source_coverage.apar} total={data.total_competitors} />
                  <CoverageBar label="DfE Provider Activity" count={data.source_coverage.dfe_activity} total={data.total_competitors} />
                  <CoverageBar label="DfE QAR" count={data.source_coverage.dfe_qar} total={data.total_competitors} />
                  <CoverageBar label="Ofsted" count={data.source_coverage.ofsted} total={data.total_competitors} />
                  <CoverageBar label="Google Place approved" count={data.source_coverage.google_place} total={data.total_competitors} />
                </div>
              </SectionCard>

              {/* FATP portfolio size */}
              <SectionCard title="FATP Standards Portfolio Size" icon="ri-stack-line">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-heading font-bold text-foreground-950">
                      {data.fatp_standards_portfolio.average ?? "—"}
                    </p>
                    <p className="text-xs text-foreground-500 mt-1">Average per provider</p>
                  </div>
                  <div>
                    <p className="text-xl font-heading font-bold text-foreground-950">
                      {data.fatp_standards_portfolio.min ?? "—"}
                    </p>
                    <p className="text-xs text-foreground-500 mt-1">Smallest portfolio</p>
                  </div>
                  <div>
                    <p className="text-xl font-heading font-bold text-foreground-950">
                      {data.fatp_standards_portfolio.max ?? "—"}
                    </p>
                    <p className="text-xs text-foreground-500 mt-1">Largest portfolio</p>
                  </div>
                </div>
              </SectionCard>

              {/* Ofsted distributions */}
              <SectionCard title="Ofsted — Renewed Framework Distribution" icon="ri-shield-star-line">
                <DistributionList distribution={data.ofsted_renewed_distribution} />
              </SectionCard>

              <SectionCard title="Ofsted — Legacy Framework Distribution" icon="ri-history-line">
                <DistributionList distribution={data.ofsted_legacy_distribution} />
              </SectionCard>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
