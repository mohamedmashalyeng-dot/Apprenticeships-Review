import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import StarRating from "@/components/base/StarRating";
import LoadingIndicator from "@/components/base/LoadingIndicator";
import { getCompanies } from "@/services/companies.service";
import { getCategories } from "@/services/categories.service";
import type { Provider } from "@/types/provider";
import type { ApprenticeshipCategory } from "@/types/category";

export default function TopRated() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<ApprenticeshipCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    getCompanies({
      sortBy: "rating",
      categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
      level: levelFilter !== "all" ? parseInt(levelFilter) : undefined,
    })
      .then(setProviders)
      .finally(() => setIsLoading(false));
  }, [categoryFilter, levelFilter]);

  const rankedProviders = useMemo(() => {
    const sorted = providers
      .filter((p) => p.total_reviews >= 5)
      .sort((a, b) => {
        const ratingDifference = Number(b.average_rating.toFixed(1)) - Number(a.average_rating.toFixed(1));
        if (ratingDifference !== 0) return ratingDifference;
        return a.trading_name.localeCompare(b.trading_name);
      });

    let previousScore: number | null = null;
    let rank = 0;
    return sorted.map((provider, index) => {
      const score = Number(provider.average_rating.toFixed(1));
      if (score !== previousScore) {
        rank = index + 1;
        previousScore = score;
      }
      return { provider, rank };
    });
  }, [providers]);

  const hasFilters = categoryFilter !== "all" || levelFilter !== "all";

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/c48fd67eb7fb4d3d8ee0b39bb8f6ee2c.png"
            alt="Abstract background representing top rated providers"
            width={467}
            height={313}
            className="site-image-hero"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
              Apprenticeship provider ratings
            </h1>
            <p className="mt-3 text-sm md:text-base text-white/90 max-w-2xl">
              Compare apprenticeship training providers using published reviews. Providers need at least five eligible reviews to appear in this list.
            </p>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/75">
              Ratings reflect reviewers&apos; experiences. They are not inspection grades or a guarantee that a provider will meet your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="w-full bg-background-100 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-4">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-foreground-700">Apprenticeship subject</span>
            <select
              aria-label="Apprenticeship subject"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-background-50 border border-background-200/70 rounded-md text-foreground-900 focus:outline-none focus:border-primary-400 cursor-pointer"
            >
              <option value="all">All subjects</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <label htmlFor="provider-level-filter" className="text-sm font-medium text-foreground-700">Level</label>
            <select
              id="provider-level-filter"
              aria-label="Apprenticeship level"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-background-50 border border-background-200/70 rounded-md text-foreground-900 focus:outline-none focus:border-primary-400 cursor-pointer"
            >
              <option value="all">All levels</option>
              {[2, 3, 4, 5, 6, 7].map((level) => <option key={level} value={level}>Level {level}</option>)}
            </select>
            {hasFilters && (
              <button
                onClick={() => {
                  setCategoryFilter("all");
                  setLevelFilter("all");
                }}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer whitespace-nowrap"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Rankings */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2 text-sm text-foreground-600">
              <p><span className="font-semibold text-foreground-900">{rankedProviders.length}</span> providers meet the review threshold</p>
              <p>Sorted by: <span className="font-semibold text-foreground-900">Highest rating first</span></p>
            </div>
            {isLoading ? (
              <div className="py-16">
                <LoadingIndicator />
              </div>
            ) : rankedProviders.length > 0 ? (
              <div className="flex flex-col gap-3">
                {rankedProviders.map(({ provider: p, rank }) => (
                  <article
                    key={p.provider_id}
                    className="flex items-center gap-4 rounded-2xl border border-background-200/70 bg-background-50 p-5 transition-colors hover:border-primary-200"
                  >
                    {/* Rank */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-background-100 font-heading text-lg font-bold text-foreground-700">
                      {rank}
                    </div>

                    {/* Provider info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground-900">
                        <Link to={`/provider/${p.provider_id}`} className="hover:text-primary-600">{p.trading_name}</Link>
                      </h3>
                      <p className="text-xs text-foreground-500 mt-0.5 truncate">
                        {p.category_names.join(", ") || p.location}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={p.average_rating} size="sm" />
                        <span className="text-sm font-bold text-foreground-900">{p.average_rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-foreground-500 mt-0.5">
                        {p.total_reviews.toLocaleString()} eligible reviews
                        {p.recommendation_percent != null && ` · ${p.recommendation_percent}% recommend`}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
                      <Link to={`/provider/${p.provider_id}#reviews`} className="font-semibold text-primary-600 hover:underline">Read reviews</Link>
                      <Link to={`/provider/${p.provider_id}`} className="text-foreground-600 hover:text-primary-600 hover:underline">View provider</Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-2xl bg-background-100 text-foreground-400 mb-4">
                  <i className="ri-trophy-line text-xl" />
                </div>
                <p className="mb-1 text-sm font-medium text-foreground-700">No providers meet the review threshold for these filters.</p>
                <p className="text-xs text-foreground-500">Change your filters or browse all providers.</p>
              </div>
            )}

            {/* Honesty note */}
            <div className="mt-8 p-4 bg-secondary-50 dark:bg-secondary-950/40 border border-secondary-200/60 dark:border-secondary-800/40 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-secondary-100 text-secondary-600">
                  <i className="ri-information-line text-base" />
                </div>
                <p className="text-xs text-foreground-600 leading-relaxed">
                  Ratings use eligible published reviews for the provider shown. Scores are rounded to one decimal place, and equal displayed scores share the same rank and are listed alphabetically. Read our{" "}
                  <Link to="/methodology" className="text-primary-600 hover:text-primary-700 font-medium">methodology</Link>{" "}
                  to understand how ratings are calculated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
