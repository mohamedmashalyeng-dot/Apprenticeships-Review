import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import StarRating from "@/components/base/StarRating";
import { providers } from "@/mocks/providers";
import { getProviderRating } from "@/mocks/ratings";
import { categories } from "@/mocks/categories";
import { getProviderStandards } from "@/mocks/providerStandards";

function getProviderCategories(providerId: string): string[] {
  const providerStds = getProviderStandards(providerId);
  return categories
    .filter((c) => c.standard_ids.some((sid) => providerStds.some((ps) => ps.standard_id === sid)))
    .map((c) => c.name);
}

export default function TopRated() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const rankedProviders = useMemo(() => {
    const ranked = providers
      .map((p) => {
        const rating = getProviderRating(p.provider_id);
        return {
          ...p,
          overall: rating?.overall ?? 0,
          reviewCount: rating?.review_count ?? 0,
          recommendation: rating?.recommendation_percent ?? 0,
          providerCategories: getProviderCategories(p.provider_id),
        };
      })
      // Only rank providers with genuine review data (at least a few reviews)
      .filter((p) => p.reviewCount >= 5)
      .sort((a, b) => {
        // Sort by overall rating, tie-break by review count
        if (b.overall !== a.overall) return b.overall - a.overall;
        return b.reviewCount - a.reviewCount;
      });

    let result = ranked;
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.providerCategories.includes(categoryFilter));
    }
    return result;
  }, [categoryFilter, levelFilter]);

  const hasFilters = categoryFilter !== "all" || levelFilter !== "all";

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://readdy.ai/api/search-image?query=A%20team%20of%20professionals%20celebrating%20success%20and%20collaboration%20with%20a%20high%20five%20and%20smiles%20in%20a%20bright%20modern%20office%2C%20warm%20natural%20light%2C%20soft%20cream%20and%20amber%20tones%20with%20golden%20accents%2C%20editorial%20photography%2C%20shallow%20depth%20of%20field%2C%20high%20detail%2C%20realistic%20joyful%20professional%20atmosphere&width=1800&height=700&seq=top-rated-hero&orientation=landscape&nocache=true"
            alt="Abstract background representing top rated providers"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
              Top rated providers
            </h1>
            <p className="mt-3 text-sm md:text-base text-white/90 max-w-2xl">
              Rankings based on genuine apprentice and employer reviews. Providers with fewer than 5 reviews are not ranked to keep the list meaningful.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="w-full bg-background-100 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-4">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-foreground-700">Filter by:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-background-50 border border-background-200/70 rounded-md text-foreground-900 focus:outline-none focus:border-primary-400 cursor-pointer"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
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
            {rankedProviders.length > 0 ? (
              <div className="flex flex-col gap-3">
                {rankedProviders.map((p, idx) => (
                  <Link
                    key={p.provider_id}
                    to={`/provider/${p.provider_id}`}
                    className="flex items-center gap-4 p-5 bg-background-50 border border-background-200/70 rounded-2xl hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Rank */}
                    <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-heading text-lg font-bold ${
                      idx === 0
                        ? "bg-accent-500 text-white"
                        : idx === 1
                        ? "bg-secondary-200 text-secondary-800"
                        : idx === 2
                        ? "bg-primary-100 text-primary-700"
                        : "bg-background-100 text-foreground-600"
                    }`}>
                      {idx + 1}
                    </div>

                    {/* Provider info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground-900 truncate">{p.trading_name}</h3>
                      <p className="text-xs text-foreground-500 mt-0.5 truncate">
                        {p.providerCategories.join(", ") || p.location}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={p.overall} size="sm" />
                        <span className="text-sm font-bold text-foreground-900">{p.overall.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-foreground-500 mt-0.5">
                        {p.reviewCount} reviews · {p.recommendation}% recommend
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-2xl bg-background-100 text-foreground-400 mb-4">
                  <i className="ri-trophy-line text-xl" />
                </div>
                <p className="text-sm font-medium text-foreground-700 mb-1">No providers in this category yet</p>
                <p className="text-xs text-foreground-500">Try a different category or clear the filters.</p>
              </div>
            )}

            {/* Honesty note */}
            <div className="mt-8 p-4 bg-secondary-50 dark:bg-secondary-950/40 border border-secondary-200/60 dark:border-secondary-800/40 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-secondary-100 text-secondary-600">
                  <i className="ri-information-line text-base" />
                </div>
                <p className="text-xs text-foreground-600 leading-relaxed">
                  Rankings are based on genuine review data collected on our platform and are not paid placements.
                  Review volume is currently growing, so rankings reflect a limited sample. Read our{" "}
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