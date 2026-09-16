import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import LoadingIndicator from "@/components/base/LoadingIndicator";
import { getCompetitors } from "@/services/competitors.service";
import type { CompetitorSummary } from "@/types/competitor";

const TARGET_CODES = ["ST0596", "ST0612", "ST0310", "ST0845"] as const;

function formatPercent(value: number | null): string {
  return value == null ? "—" : `${value.toFixed(1)}%`;
}

function formatNumber(value: number | null): string {
  return value == null ? "—" : value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function OfstedBadge({ era, label }: { era: string | null; label: string | null }) {
  if (!label) return <span className="text-foreground-400">Not available</span>;
  const positive = ["Outstanding", "Good", "Exceptional", "Strong standard", "Expected standard"].includes(label);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
        positive ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
      }`}
    >
      {label} <span className="ml-1 text-foreground-400">({era})</span>
    </span>
  );
}

export default function CompetitorsList() {
  const [competitors, setCompetitors] = useState<CompetitorSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [targetFilter, setTargetFilter] = useState<string>("all");

  useEffect(() => {
    getCompetitors()
      .then(setCompetitors)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = competitors;
    if (targetFilter !== "all") {
      result = result.filter((c) => c.target_standards.some((t) => t.st_code === targetFilter && t.kbc_mapped));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || (c.ukprn ?? "").includes(q));
    }
    return result;
  }, [competitors, search, targetFilter]);

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      <section className="w-full bg-background-50 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-10">
          <div className="max-w-7xl mx-auto">
            <Link to="/home" className="text-xs text-foreground-500 hover:text-primary-600">
              &larr; Home
            </Link>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                  Provider Intelligence
                </h1>
                <p className="mt-2 text-sm text-foreground-600">
                  {competitors.length} UK apprenticeship providers compared across Trustpilot, Find a Training Provider,
                  DfE achievement data and Ofsted.
                </p>
              </div>
              <Link
                to="/competitors/overview"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-background-50 border border-background-200/70 text-sm font-semibold text-primary-500 rounded-full hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-600 transition-all duration-200 whitespace-nowrap"
              >
                <i className="ri-bar-chart-2-line" />
                Landscape overview
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 md:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 text-sm" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by provider name or UKPRN..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-background-50 border border-background-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
              className="px-4 py-2.5 text-sm bg-background-50 border border-background-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All target standards</option>
              <option value="ST0596">ST0596 · Marketing Executive</option>
              <option value="ST0612">ST0612 · Marketing Manager</option>
              <option value="ST0310">ST0310 · Associate Project Manager</option>
              <option value="ST0845">ST0845 · Project Controls Professional</option>
            </select>
          </div>

          {isLoading ? (
            <div className="py-16">
              <LoadingIndicator />
            </div>
          ) : error ? (
            <div className="p-10 bg-background-100 rounded-2xl text-center text-sm text-foreground-500">
              Couldn&apos;t load provider data.
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[75vh] rounded-2xl border border-background-200/70 bg-background-50">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-background-100 text-left text-xs font-semibold text-foreground-600 uppercase tracking-wide shadow-[0_1px_0_rgba(0,0,0,0.06)]">
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Target standards</th>
                    <th className="py-3 px-4">Trustpilot</th>
                    <th className="py-3 px-4">FATP achievement</th>
                    <th className="py-3 px-4">FATP standards</th>
                    <th className="py-3 px-4">DfE starts</th>
                    <th className="py-3 px-4">QAR achievement</th>
                    <th className="py-3 px-4">Ofsted</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.competitor_id} className="border-t border-background-100 hover:bg-background-100/60">
                      <td className="py-3 px-4">
                        <Link
                          to={`/competitors/${c.competitor_id}`}
                          className="font-semibold text-foreground-900 hover:text-primary-600"
                        >
                          {c.name}
                        </Link>
                        <p className="text-xs text-foreground-400">{c.ukprn ?? "No UKPRN"}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {TARGET_CODES.map((code) => {
                            const t = c.target_standards.find((x) => x.st_code === code);
                            const active = t?.kbc_mapped;
                            return (
                              <span
                                key={code}
                                title={`${code}${active ? " — mapped" : ""}`}
                                className={`w-2.5 h-2.5 rounded-full ${active ? "bg-primary-500" : "bg-background-200"}`}
                              />
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {c.trustpilot_rating != null ? (
                          <span>
                            {c.trustpilot_rating.toFixed(1)} <i className="ri-star-fill text-primary-500 text-xs" />{" "}
                            <span className="text-foreground-400">({formatNumber(c.trustpilot_review_count)})</span>
                          </span>
                        ) : (
                          <span className="text-foreground-400">Not available</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{formatPercent(c.fatp_achievement_rate)}</td>
                      <td className="py-3 px-4">{c.fatp_standards_count || "—"}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {formatNumber(c.dfe_activity_starts)}
                        {c.dfe_activity_period && <span className="text-foreground-400"> ({c.dfe_activity_period})</span>}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {formatPercent(c.qar_achievement_rate)}
                        {c.qar_period && <span className="text-foreground-400"> ({c.qar_period})</span>}
                      </td>
                      <td className="py-3 px-4">
                        <OfstedBadge era={c.ofsted_framework_era} label={c.ofsted_label} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="py-10 text-center text-sm text-foreground-500">No providers match your filters.</p>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
