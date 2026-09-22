import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import LoadingIndicator from "@/components/base/LoadingIndicator";
import Footer from "@/components/feature/Footer";
import Navbar from "@/components/feature/Navbar";
import ProviderCard from "@/components/feature/ProviderCard";
import { getCategories } from "@/services/categories.service";
import { getCompanies, type CompanyFilters } from "@/services/companies.service";
import { getStandards } from "@/services/standards.service";
import type { ApprenticeshipCategory } from "@/types/category";
import type { Provider } from "@/types/provider";

const PAGE_SIZE = 24;

type SortBy = NonNullable<CompanyFilters["sortBy"]>;
type ReviewAvailability = "all" | "with-reviews";

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function FindProvider() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const categoryFilter = searchParams.get("category") || "all";
  const rawLevel = searchParams.get("level") ?? "";
  const levelFilter = /^[2-7]$/.test(rawLevel) ? rawLevel : "all";
  const rawRating = searchParams.get("rating") ?? "";
  const ratingFilter = ["3", "3.5", "4", "4.5"].includes(rawRating) ? rawRating : "all";
  const reviewAvailability: ReviewAvailability = searchParams.get("reviews") === "with-reviews" ? "with-reviews" : "all";
  const rawSort = searchParams.get("sort");
  const sortBy: SortBy = rawSort === "rating" || rawSort === "reviews" || rawSort === "name" ? rawSort : "name";
  const requestedPage = parsePage(searchParams.get("page"));

  const [error, setError] = useState(false);
  const [optionsError, setOptionsError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [optionsRetry, setOptionsRetry] = useState(0);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<ApprenticeshipCategory[]>([]);
  const [levels, setLevels] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function updateFilter(key: string, value: string, replace = false) {
    setIsLoading(true);
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (!value || value === "all") next.delete(key);
        else next.set(key, value);
        next.delete("page");
        return next;
      },
      { replace },
    );
  }

  const setSearchQuery = (value: string) => updateFilter("q", value, true);
  const setCategoryFilter = (value: string) => updateFilter("category", value);
  const setLevelFilter = (value: string) => updateFilter("level", value);
  const setRatingFilter = (value: string) => updateFilter("rating", value);
  const setReviewAvailability = (value: string) => updateFilter("reviews", value);
  const setSortBy = (value: string) => updateFilter("sort", value);

  function setPage(page: number) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (page <= 1) next.delete("page");
      else next.set("page", String(page));
      return next;
    });
  }

  useEffect(() => {
    let active = true;
    Promise.all([getCategories(), getStandards()])
      .then(([cats, standards]) => {
        if (!active) return;
        setOptionsError(false);
        setCategories(cats);
        setLevels(Array.from(new Set(standards.map((s) => s.level))).sort((a, b) => a - b));
      })
      .catch(() => {
        if (active) setOptionsError(true);
      });
    return () => {
      active = false;
    };
  }, [optionsRetry]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setIsLoading(true);
      setError(false);
      getCompanies(
        {
          search: searchQuery.trim() || undefined,
          categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
          level: levelFilter !== "all" ? Number(levelFilter) : undefined,
          minRating: ratingFilter !== "all" ? Number(ratingFilter) : undefined,
          minReviewCount: reviewAvailability === "with-reviews" ? 1 : undefined,
          sortBy,
        },
        controller.signal,
      )
        .then((results) => {
          if (active) setProviders(results);
        })
        .catch(() => {
          if (active) setError(true);
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 200);
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchQuery, categoryFilter, levelFilter, ratingFilter, reviewAvailability, sortBy, retry]);

  const selectedCategoryName = categories.find((c) => c.id === categoryFilter)?.name;
  const profileDates = providers.map((p) => p.data_last_updated).filter(Boolean);
  const latestProfileCheck = profileDates
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const totalPages = Math.max(1, Math.ceil(providers.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const firstResult = providers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastResult = Math.min(currentPage * PAGE_SIZE, providers.length);

  const pagedProviders = useMemo(
    () => providers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [currentPage, providers],
  );

  const selectedFilters = [
    searchQuery.trim() ? { key: "q", label: `Provider name: ${searchQuery.trim()}` } : null,
    categoryFilter !== "all" ? { key: "category", label: `Subject: ${selectedCategoryName ?? categoryFilter}` } : null,
    levelFilter !== "all" ? { key: "level", label: `Apprenticeship level: ${levelFilter}` } : null,
    ratingFilter !== "all" ? { key: "rating", label: `Minimum rating: ${ratingFilter} out of 5` } : null,
    reviewAvailability !== "all" ? { key: "reviews", label: "Providers with published reviews" } : null,
  ].filter((item): item is { key: string; label: string } => item !== null);

  const hasActiveFilters = selectedFilters.length > 0;

  const clearFilters = () => {
    setIsLoading(true);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      ["q", "category", "level", "rating", "reviews", "page"].forEach((key) => next.delete(key));
      return next;
    });
  };

  const removeFilter = (key: string) => {
    setIsLoading(true);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete(key);
      next.delete("page");
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/85711c50ec3243f4aa70edc84b7cfd69.png"
            alt=""
            className="site-image-hero"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />
        </div>
        <div className="relative z-10 w-full px-4 py-20 md:px-6 md:py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
              Find an apprenticeship training provider
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/90 md:text-base">
              Explore providers in our directory, read available reviews and compare training options for your shortlist.
            </p>

            <div className="mt-6 max-w-xl">
              <label htmlFor="provider-search" className="mb-2 block text-sm font-medium text-white">
                Search by provider name
              </label>
              <div className="flex flex-col gap-2 rounded-xl border border-background-50/30 bg-background-50 p-2 shadow-sm sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400">
                    <i className="ri-search-line text-lg" />
                  </div>
                  <input
                    id="provider-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter a provider name"
                    className="w-full bg-transparent py-3 pl-10 pr-3 text-sm text-foreground-900 outline-none placeholder:text-foreground-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => updateFilter("q", searchQuery.trim())}
                  className="rounded-lg bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  Find providers
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
              <Link to="/methodology" className="text-primary-200 underline-offset-4 hover:underline">
                How to compare providers
              </Link>
              <Link to="/data-sources" className="text-white/85 underline-offset-4 hover:underline">
                Data sources
              </Link>
              <Link to="/about" className="text-white/85 underline-offset-4 hover:underline">
                Who operates this site
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-background-50">
        <div className="w-full px-4 py-8 md:px-6 md:py-10 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 rounded-2xl border border-background-200 bg-background-100/60 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground-900">Providers in our directory</p>
                  <p className="mt-1 text-xs leading-relaxed text-foreground-600">
                    Coverage and training availability should be checked at provider level. Ratings shown here are separate from published provider data and external business reviews.
                  </p>
                </div>
                {latestProfileCheck && (
                  <p className="shrink-0 text-xs font-medium text-foreground-600">
                    Latest profile check: {formatDate(latestProfileCheck.toISOString())}
                  </p>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium">
                <Link to="/methodology" className="text-primary-600 hover:underline">
                  How providers are listed
                </Link>
                <Link to="/review-policy" className="text-primary-600 hover:underline">
                  How ratings work
                </Link>
                <Link to="/data-sources" className="text-primary-600 hover:underline">
                  Data sources
                </Link>
                <Link to="/about" className="text-primary-600 hover:underline">
                  Who operates this site
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row">
              <aside className="lg:w-64 lg:flex-shrink-0">
                <div className="lg:sticky lg:top-24">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-heading text-sm font-semibold text-foreground-800">Filters</h2>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                        Clear all filters
                      </button>
                    )}
                  </div>

                  {optionsError && (
                    <div role="alert" className="mb-4 rounded-xl bg-background-100 p-3 text-sm text-foreground-700">
                      Filter options could not load.{" "}
                      <button type="button" onClick={() => setOptionsRetry((value) => value + 1)} className="font-semibold text-primary-600 underline">
                        Retry
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col gap-5">
                    <div>
                      <label htmlFor="provider-subject-filter" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground-500">
                        Subject
                      </label>
                      <select
                        id="provider-subject-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full cursor-pointer rounded-md border border-background-200/70 bg-background-100 px-3 py-2 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none"
                      >
                        <option value="all">All subjects</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="provider-level-filter" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground-500">
                        Apprenticeship level
                      </label>
                      <select
                        id="provider-level-filter"
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="w-full cursor-pointer rounded-md border border-background-200/70 bg-background-100 px-3 py-2 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none"
                      >
                        <option value="all">All levels</option>
                        {levels.map((l) => (
                          <option key={l} value={l}>
                            Level {l}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="provider-review-filter" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground-500">
                        Review availability
                      </label>
                      <select
                        id="provider-review-filter"
                        value={reviewAvailability}
                        onChange={(e) => setReviewAvailability(e.target.value)}
                        className="w-full cursor-pointer rounded-md border border-background-200/70 bg-background-100 px-3 py-2 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none"
                      >
                        <option value="all">All providers</option>
                        <option value="with-reviews">Providers with published reviews</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="provider-rating-filter" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground-500">
                        Minimum review rating
                      </label>
                      <select
                        id="provider-rating-filter"
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                        className="w-full cursor-pointer rounded-md border border-background-200/70 bg-background-100 px-3 py-2 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none"
                      >
                        <option value="all">Any rating</option>
                        <option value="4.5">4.5 out of 5 and up</option>
                        <option value="4">4.0 out of 5 and up</option>
                        <option value="3.5">3.5 out of 5 and up</option>
                      </select>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="min-w-0 flex-1">
                <div className="mb-5 flex flex-col gap-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <p className="text-sm text-foreground-600" aria-live="polite">
                      {isLoading
                        ? "Finding providers..."
                        : error
                          ? "Results unavailable"
                          : providers.length === 0
                            ? "No providers match your search"
                            : `Showing ${firstResult} to ${lastResult} of ${providers.length} provider${providers.length === 1 ? "" : "s"}`}
                    </p>
                    <div className="flex items-center gap-2">
                      <label htmlFor="provider-sort" className="text-sm font-medium text-foreground-700">
                        Sort by
                      </label>
                      <select
                        id="provider-sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="cursor-pointer rounded-md border border-background-200/70 bg-background-100 px-3 py-2 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none"
                      >
                        <option value="name">Provider name: A to Z</option>
                        <option value="reviews">Most reviewed on this website</option>
                        <option value="rating">Highest average rating on this website</option>
                      </select>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedFilters.map((filter) => (
                        <button
                          key={filter.key}
                          type="button"
                          onClick={() => removeFilter(filter.key)}
                          className="inline-flex items-center gap-2 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2 text-xs font-medium text-primary-700 hover:border-primary-300"
                        >
                          {filter.label}
                          <span aria-hidden="true">x</span>
                        </button>
                      ))}
                      <button type="button" onClick={clearFilters} className="text-xs font-semibold text-primary-600 hover:underline">
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>

                {isLoading ? (
                  <div className="py-16">
                    <LoadingIndicator />
                  </div>
                ) : error ? (
                  <div role="alert" className="rounded-2xl border border-background-200 p-8 text-center">
                    <h2 className="font-semibold text-foreground-900">We could not load the providers</h2>
                    <p className="mt-2 text-sm text-foreground-600">Your filters are saved. Please try again.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoading(true);
                        setRetry((value) => value + 1);
                      }}
                      className="mt-4 rounded-xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Try again
                    </button>
                  </div>
                ) : providers.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {pagedProviders.map((p) => (
                        <ProviderCard key={p.provider_id} provider={p} />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <nav aria-label="Provider result pages" className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-sm text-foreground-600">
                          Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPage(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="rounded-lg border border-background-200 px-4 py-2 text-sm font-semibold text-foreground-700 hover:border-primary-300 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            onClick={() => setPage(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="rounded-lg border border-background-200 px-4 py-2 text-sm font-semibold text-foreground-700 hover:border-primary-300 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </nav>
                    )}
                  </>
                ) : (
                  <div className="py-16 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-background-100 text-foreground-400">
                      <i className="ri-search-line text-xl" />
                    </div>
                    <p className="mb-1 text-sm font-medium text-foreground-700">No providers match your search</p>
                    <p className="mb-4 text-xs text-foreground-500">Try a different provider name or clear some filters.</p>
                    <button
                      onClick={clearFilters}
                      className="cursor-pointer rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
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
