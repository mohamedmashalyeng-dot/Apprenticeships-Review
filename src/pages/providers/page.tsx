import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import ProviderCard from "@/components/feature/ProviderCard";
import LoadingIndicator from "@/components/base/LoadingIndicator";
import { getCompanies } from "@/services/companies.service";
import { getCategories } from "@/services/categories.service";
import { getStandards } from "@/services/standards.service";
import type { Provider } from "@/types/provider";
import type { ApprenticeshipCategory } from "@/types/category";


export default function FindProvider() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const categoryFilter = searchParams.get("category") || "all";
  const rawLevel = searchParams.get("level") ?? "";
  const levelFilter = /^[2-7]$/.test(rawLevel) ? rawLevel : "all";
  const rawRating = searchParams.get("rating") ?? "";
  const ratingFilter = ["3", "4", "4.5"].includes(rawRating) ? rawRating : "all";
  const rawSort = searchParams.get("sort");
  const sortBy = rawSort === "reviews" || rawSort === "name" ? rawSort : "rating";
  const [error, setError] = useState(false);
  const [optionsError, setOptionsError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [optionsRetry, setOptionsRetry] = useState(0);
  function updateFilter(key: string, value: string, replace = false) {
    setIsLoading(true);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (!value || value === "all") next.delete(key);
      else next.set(key, value);
      return next;
    }, { replace });
  }
  const setSearchQuery = (value: string) => updateFilter("q", value, true);
  const setCategoryFilter = (value: string) => updateFilter("category", value);
  const setLevelFilter = (value: string) => updateFilter("level", value);
  const setRatingFilter = (value: string) => updateFilter("rating", value);
  const setSortBy = (value: string) => updateFilter("sort", value);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<ApprenticeshipCategory[]>([]);
  const [levels, setLevels] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getCategories(), getStandards()])
      .then(([cats, standards]) => {
        if (!active) return;
        setOptionsError(false);
        setCategories(cats);
        setLevels(Array.from(new Set(standards.map((s) => s.level))).sort((a, b) => a - b));
      })
      .catch(() => { if (active) setOptionsError(true); });
    return () => { active = false; };
  }, [optionsRetry]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setIsLoading(true);
      setError(false);
      getCompanies({
        search: searchQuery.trim() || undefined,
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
        level: levelFilter !== "all" ? Number(levelFilter) : undefined,
        minRating: ratingFilter !== "all" ? Number(ratingFilter) : undefined,
        sortBy,
      }, controller.signal)
        .then((results) => { if (active) setProviders(results); })
        .catch(() => { if (active) setError(true); })
        .finally(() => { if (active) setIsLoading(false); });
    }, 200);
    return () => { active = false; controller.abort(); clearTimeout(timeout); };
  }, [searchQuery, categoryFilter, levelFilter, ratingFilter, sortBy, retry]);

  const clearFilters = () => {
    setIsLoading(true);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      ["q", "category", "level", "rating"].forEach((key) => next.delete(key));
      return next;
    });
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    categoryFilter !== "all" ||
    levelFilter !== "all" ||
    ratingFilter !== "all";

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://readdy.ai/api/search-image?query=A%20team%20of%20professionals%20collaborating%20around%20a%20large%20table%20reviewing%20provider%20directories%20and%20listings%20on%20laptops%20in%20a%20bright%20modern%20office%2C%20warm%20natural%20light%2C%20soft%20cream%20and%20amber%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20high%20detail%2C%20realistic%20collaborative%20professional%20atmosphere&width=1800&height=700&seq=providers-hero&orientation=landscape&nocache=true"
            alt="Abstract background representing provider directory"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
              Find an apprenticeship provider
            </h1>
            <p className="mt-3 text-sm md:text-base text-white/90 max-w-2xl">
              Search and filter apprenticeship training providers by name, sector, level, and rating.
            </p>

            <div className="mt-6 relative max-w-xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-400">
                <i className="ri-search-line text-lg" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by provider name, location, or UKPRN..."
                className="w-full pl-12 pr-4 py-3.5 bg-background-50/95 border border-background-50/30 rounded-full text-sm text-foreground-900 placeholder:text-foreground-400 outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-200 transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar filters */}
              <div className="lg:w-60 flex-shrink-0">
                <div className="lg:sticky lg:top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-sm font-semibold text-foreground-800">Filters</h3>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                        Clear all
                      </button>
                    )}
                  </div>

                  {optionsError && <div role="alert" className="mb-4 rounded-xl bg-background-100 p-3 text-sm text-foreground-700">
                    Filter options couldn?t load. <button type="button" onClick={() => setOptionsRetry((value) => value + 1)} className="font-semibold text-primary-600 underline">Retry</button>
                  </div>}
                  <div className="flex flex-col gap-5">
                    {/* Category */}
                    <div>
                      <label className="text-xs font-semibold text-foreground-500 mb-2 uppercase tracking-wide block">Sector</label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-background-100 border border-background-200/70 rounded-md text-foreground-900 focus:outline-none focus:border-primary-400 cursor-pointer"
                      >
                        <option value="all">All sectors</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Level */}
                    <div>
                      <label className="text-xs font-semibold text-foreground-500 mb-2 uppercase tracking-wide block">Level</label>
                      <select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-background-100 border border-background-200/70 rounded-md text-foreground-900 focus:outline-none focus:border-primary-400 cursor-pointer"
                      >
                        <option value="all">All levels</option>
                        {levels.map((l) => (
                          <option key={l} value={l}>Level {l}</option>
                        ))}
                      </select>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="text-xs font-semibold text-foreground-500 mb-2 uppercase tracking-wide block">Minimum rating</label>
                      <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-background-100 border border-background-200/70 rounded-md text-foreground-900 focus:outline-none focus:border-primary-400 cursor-pointer"
                      >
                        <option value="all">Any rating</option>
                        <option value="4.5">4.5 &amp; up</option>
                        <option value="4">4.0 &amp; up</option>
                        <option value="3.5">3.5 &amp; up</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-5 gap-3">
                  <p className="text-sm text-foreground-600">
                    {isLoading ? "Finding providers?" : error ? "Results unavailable" : `${providers.length} provider${providers.length !== 1 ? "s" : ""} found`}
                  </p>
                  <select
                    aria-label="Sort providers"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-3 py-2 text-sm bg-background-100 border border-background-200/70 rounded-md text-foreground-900 focus:outline-none focus:border-primary-400 cursor-pointer"
                  >
                    <option value="rating">Sort by rating</option>
                    <option value="reviews">Sort by reviews</option>
                    <option value="name">Sort by name</option>
                  </select>
                </div>

                {isLoading ? (
                  <div className="py-16">
                    <LoadingIndicator />
                  </div>
                ) : error ? (
                  <div role="alert" className="rounded-2xl border border-background-200 p-8 text-center">
                    <h2 className="font-semibold text-foreground-900">We couldn?t load providers</h2>
                    <p className="mt-2 text-sm text-foreground-600">Your filters are saved. Try loading the results again.</p>
                    <button type="button" onClick={() => { setIsLoading(true); setRetry((value) => value + 1); }} className="mt-4 rounded-xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white">Try again</button>
                  </div>
                ) : providers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {providers.map((p) => <ProviderCard key={p.provider_id} provider={p} />)}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-2xl bg-background-100 text-foreground-400 mb-4">
                      <i className="ri-search-line text-xl" />
                    </div>
                    <p className="text-sm font-medium text-foreground-700 mb-1">No providers match your filters</p>
                    <p className="text-xs text-foreground-500 mb-4">Try adjusting your search or clearing the filters.</p>
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
