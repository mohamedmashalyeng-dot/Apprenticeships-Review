import { useState, useEffect, useMemo, type ReactNode } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import StarRating from "@/components/base/StarRating";
import VerifiedBadge from "@/components/base/VerifiedBadge";
import LoadingIndicator from "@/components/base/LoadingIndicator";
import { getCompanies } from "@/services/companies.service";
import { getStandards, getAllCompanyStandards, resolveStandards } from "@/services/standards.service";
import { getCompanyStats, getRatingCategories } from "@/services/ratings.service";
import type { Provider, ProviderStandardLink } from "@/types/provider";
import type { Standard } from "@/types/standard";
import type { RatingCategory, ProviderRating } from "@/types/rating";

function availableText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && !["not publicly available", "n/a", "unknown"].includes(text.toLowerCase()) ? text : null;
}

function ratingCell(value: number | undefined): ReactNode {
  if (value == null || !Number.isFinite(value)) return null;
  return <div className="flex items-center gap-2">
    <StarRating rating={value} size="sm" />
    <span className="text-xs font-semibold text-foreground-800">{value.toFixed(1)}</span>
  </div>;
}

const compareFields = [
  { key: "trading_name", label: "Provider Name" },
  { key: "UKPRN", label: "UKPRN" },
  { key: "legal_name", label: "Legal Entity" },
  { key: "Ofsted_status", label: "Ofsted Status" },
  { key: "delivery_model", label: "Delivery Model" },
] as const;

export default function CompareProviders() {
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get("providers")?.split(",") ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProviders, setSelectedProviders] = useState<string[]>(() => preselected.slice(0, 3));
  const [showSelector, setShowSelector] = useState(!preselected.length);

  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [allStandards, setAllStandards] = useState<Standard[]>([]);
  const [ratingCategories, setRatingCategories] = useState<RatingCategory[]>([]);
  const [standardsByProvider, setStandardsByProvider] = useState<Record<string, ProviderStandardLink[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [providerRatings, setProviderRatings] = useState<Record<string, ProviderRating>>({});
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);

  // Initial load: provider list, standards, rating category definitions, and every
  // provider's delivered-standards links (needed for the standard counts shown in
  // the selector as well as the "Matching Standards" comparison row) — fetched once in bulk
  // rather than one request per provider.
  useEffect(() => {
    Promise.all([getCompanies(), getStandards(), getRatingCategories(), getAllCompanyStandards()])
      .then(([companies, stds, cats, allLinks]) => {
        setAllProviders(companies);
        setAllStandards(stds);
        setRatingCategories(cats);
        setSelectedProviders((prev) => prev.filter((id) => companies.some((p) => p.provider_id === id)));

        const map: Record<string, ProviderStandardLink[]> = {};
        for (const link of allLinks) {
          (map[link.provider_id] ??= []).push(link);
        }
        setStandardsByProvider(map);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch ratings for any newly-selected provider that isn't cached yet.
  useEffect(() => {
    const idsToLoad = selectedProviders.filter((id) => providerRatings[id] === undefined);
    if (idsToLoad.length === 0) return;

    setIsLoadingComparison(true);
    Promise.all(
      idsToLoad.map((id) =>
        getCompanyStats(id).then((stats) => ({ id, stats }))
      )
    )
      .then((results) => {
        setProviderRatings((prev) => {
          const next = { ...prev };
          for (const r of results) next[r.id] = r.stats;
          return next;
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingComparison(false));
    // providerRatings is intentionally excluded: it's the cache this effect populates, and
    // re-running whenever it changes would refetch everything in a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProviders]);

  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return allProviders;
    const q = searchQuery.toLowerCase();
    return allProviders.filter(
      (p) =>
        p.trading_name.toLowerCase().includes(q) ||
        p.legal_name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.UKPRN.includes(q)
    );
  }, [searchQuery, allProviders]);

  const selectedProviderObjects = useMemo(
    () => allProviders.filter((p) => selectedProviders.includes(p.provider_id)),
    [selectedProviders, allProviders]
  );

  const toggleProvider = (providerId: string) => {
    setSelectedProviders((prev) => {
      if (prev.includes(providerId)) {
        return prev.filter((id) => id !== providerId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), providerId];
      }
      return [...prev, providerId];
    });
  };

  function getProviderStandardsList(providerId: string): string[] {
    const links = standardsByProvider[providerId] ?? [];
    return resolveStandards(links, allStandards).map((r) => `${r.standard.standard_name} (Level ${r.standard.level})`);
  }

  // Only database-backed values belong in the comparison. The score endpoint
  // currently returns fixed placeholders, so it is deliberately not requested.
  const sections: { title: string | null; rows: { label: string; values: ReactNode[] }[] }[] = [
    { title: null, rows: [
      ...compareFields.map((field) => ({
        label: field.label,
        values: selectedProviderObjects.map((p) => availableText(p[field.key])),
      })),
      { label: "Matching Standards", values: selectedProviderObjects.map((p) => {
        const standards = getProviderStandardsList(p.provider_id);
        return standards.length ? standards.join(", ") : null;
      }) },
    ] },
    { title: "Reviews", rows: [
      { label: "Review Count", values: selectedProviderObjects.map((p) => {
        const count = providerRatings[p.provider_id]?.review_count;
        return count != null && count > 0 ? (
          <Link
            to={`/provider/${p.provider_id}#learner-reviews`}
            className="text-primary-600 hover:text-primary-700 hover:underline font-medium"
          >
            {count} reviews
          </Link>
        ) : null;
      }) },
    ] },
    { title: "Ratings & Recommendations", rows: [
      { label: "Overall Rating", values: selectedProviderObjects.map((p) => {
        const rating = providerRatings[p.provider_id];
        return rating && rating.review_count > 0 ? ratingCell(rating.overall) : null;
      }) },
      ...ratingCategories.map((category) => ({
        label: category.label,
        values: selectedProviderObjects.map((p) => ratingCell(providerRatings[p.provider_id]?.categories[category.key])),
      })),
      { label: "Would recommend", values: selectedProviderObjects.map((p) => {
        const percent = providerRatings[p.provider_id]?.recommendation_percent;
        return percent != null ? `${percent}%` : null;
      }) },
    ] },
    { title: "Strengths & Best For", rows: [
      { label: "Strengths", values: selectedProviderObjects.map((p) => p.strengths.map(availableText).filter(Boolean).join(", ") || null) },
      { label: "Best for", values: selectedProviderObjects.map((p) => p.best_for.map(availableText).filter(Boolean).join(", ") || null) },
    ] },
  ];
  const visibleSections = sections.map((section) => ({
    ...section,
    rows: section.rows.filter((row) => row.values.some((value) => value != null)),
  })).filter((section) => section.rows.length > 0);

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* Header */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/7289fb622bb442f7a9599033ab74fc34.png"
            alt="Abstract background representing provider comparison"
            width={821}
            height={325}
            className="site-image-hero"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
              Compare Providers
            </h1>
            <p className="mt-3 text-sm md:text-base text-white/90 max-w-2xl">
              Select 2 or 3 apprenticeship training providers to compare side by side. All data is sourced from public registers and verified reviews.
            </p>
          </div>
        </div>
      </section>

      {/* Provider Selection */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold text-foreground-950">
                Select providers to compare
                <span className="ml-2 text-sm font-normal text-foreground-500">
                  ({selectedProviders.length}/3 selected)
                </span>
              </h2>
              <button
                onClick={() => setShowSelector(!showSelector)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <i className={`text-sm ${showSelector ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`} />
                {showSelector ? "Hide search" : "Show search"}
              </button>
            </div>

            {showSelector && (
              <>
                {/* Search */}
                <div className="relative mb-4">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400">
                    <i className="ri-search-line" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by provider name, location, or UKPRN..."
                    className="w-full pl-10 pr-4 py-3 bg-background-50 border border-background-200 rounded-full text-sm text-foreground-900 placeholder:text-foreground-400 outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-200"
                  />
                </div>

                {/* Provider list */}
                {isLoading ? (
                  <div className="py-8">
                    <LoadingIndicator />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                      {filteredProviders.map((p) => {
                        const isSelected = selectedProviders.includes(p.provider_id);
                        const stdCount = (standardsByProvider[p.provider_id] ?? []).length;
                        return (
                          <button
                            key={p.provider_id}
                            onClick={() => toggleProvider(p.provider_id)}
                            className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
                              isSelected
                                ? "border-primary-300 bg-primary-50/50 ring-1 ring-primary-200"
                                : "border-background-200 bg-background-50 hover:border-background-300"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground-900 truncate">
                                  {p.trading_name}
                                </p>
                                <p className="text-xs text-foreground-500 mt-0.5">{p.location}</p>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-primary-500 text-white">
                                  <i className="ri-check-line text-xs" />
                                </div>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-foreground-500">
                                {stdCount} standard{stdCount !== 1 ? "s" : ""}
                              </span>
                              {p.verification_status === "Verified" && <VerifiedBadge size="xs" icon={false} rounded="md" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {filteredProviders.length === 0 && (
                      <p className="text-sm text-foreground-500 text-center py-8">
                        No providers match your search.
                      </p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      {selectedProviderObjects.length >= 2 && (
        <section className="w-full bg-background-50">
          <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-12">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-heading text-xl font-bold text-foreground-950 mb-6">
                Side-by-Side Comparison
              </h2>

              {isLoadingComparison ? (
                <div className="py-8">
                  <LoadingIndicator />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-background-200 rounded-2xl overflow-hidden">
                    <thead>
                      <tr className="bg-background-100">
                        <th className="py-3 px-4 text-left text-xs font-semibold text-foreground-700 w-48">
                          Field
                        </th>
                        {selectedProviderObjects.map((p) => (
                          <th key={p.provider_id} className="py-3 px-4 text-left text-xs font-semibold text-foreground-700 min-w-[200px]">
                            <Link
                              to={`/provider/${p.provider_id}`}
                              className="text-primary-600 hover:text-primary-700"
                            >
                              {p.trading_name}
                            </Link>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    {visibleSections.map((section) => (
                      <tbody key={section.title ?? "profile"}>
                        {section.title && <tr className="border-t border-background-200 bg-background-50/50">
                          <th colSpan={selectedProviderObjects.length + 1} className="py-2 px-4 text-left text-xs font-semibold text-foreground-700">
                            {section.title}
                          </th>
                        </tr>}
                        {section.rows.map((row) => (
                          <tr key={row.label} className="border-t border-background-100">
                            <th scope="row" className="py-3 px-4 text-left text-xs font-medium text-foreground-600 bg-background-50/50">{row.label}</th>
                            {row.values.map((value, index) => (
                              <td key={selectedProviderObjects[index].provider_id} className="py-3 px-4 text-xs text-foreground-700">
                                {value ?? <span className="text-foreground-400" aria-label="No data">?</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    ))}
                  </table>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {selectedProviderObjects.length < 2 && (
        <section className="w-full bg-background-50">
          <div className="w-full px-4 md:px-6 lg:px-8 py-16">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-background-100 text-foreground-400 mb-5">
                <i className="ri-arrow-left-right-line text-2xl" />
              </div>
              <h2 className="font-heading text-lg font-semibold text-foreground-900 mb-2">
                Select providers to compare
              </h2>
              <p className="text-sm text-foreground-600 leading-relaxed">
                Use the search box above to find and select 2 or 3 apprenticeship training providers. Once selected, a detailed side-by-side comparison will appear here.
              </p>
              {selectedProviderObjects.length === 1 && (
                <Link
                  to={`/provider/${selectedProviderObjects[0].provider_id}`}
                  className="btn btn-lg btn-primary mt-6"
                >
                  View {selectedProviderObjects[0].trading_name}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
