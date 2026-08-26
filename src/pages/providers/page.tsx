import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import StarRating from "@/components/base/StarRating";
import { providers } from "@/mocks/providers";
import { getProviderRating } from "@/mocks/ratings";
import { categories } from "@/mocks/categories";
import { getProviderStandards } from "@/mocks/providerStandards";
import { standards, additionalStandards } from "@/mocks/standards";

const allStandards = [...standards, ...additionalStandards];

const brandColors = ["#0B5CFF", "#0891B2", "#059669", "#7C3AED", "#EA580C", "#DB2777", "#65A30D", "#B45309", "#DC2626", "#0F766E", "#6E3380"];

// Realistic provider imagery keyed by provider_id
const providerPhotos: Record<string, string> = {
  "kent-business-college":
    "https://readdy.ai/api/search-image?query=Marketing%20and%20business%20apprenticeship%20training%20session%20in%20a%20bright%20modern%20classroom%2C%20a%20trainer%20presenting%20campaign%20concepts%20to%20a%20small%20group%20of%20young%20learners%20at%20desks%20with%20laptops%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20amber%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20realistic%20professional%20training%20atmosphere%20with%20soft%20depth%20of%20field&width=600&height=360&seq=provider-kent-01&orientation=landscape",
  "fareport":
    "https://readdy.ai/api/search-image?query=Business%20administration%20apprenticeship%20workshop%20in%20a%20clean%20modern%20training%20room%2C%20learners%20collaborating%20on%20documents%20around%20a%20table%20with%20an%20instructor%20guiding%20them%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20cream%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20realistic%20professional%20training%20atmosphere%20with%20soft%20shadows&width=600&height=360&seq=provider-fareport-01&orientation=landscape",
  "oxford-professional":
    "https://readdy.ai/api/search-image?query=Higher%20level%20management%20apprenticeship%20seminar%20in%20an%20elegant%20modern%20lecture%20room%2C%20professional%20adults%20taking%20notes%20and%20discussing%20marketing%20strategy%2C%20warm%20natural%20light%20through%20tall%20windows%2C%20soft%20beige%20and%20amber%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20realistic%20academic%20professional%20atmosphere&width=600&height=360&seq=provider-oxford-01&orientation=landscape",
  "london-met":
    "https://readdy.ai/api/search-image?query=Project%20management%20apprenticeship%20online%20learning%20session%2C%20a%20young%20professional%20attending%20a%20video%20lecture%20on%20a%20laptop%20in%20a%20bright%20modern%20study%20space%20with%20planning%20charts%20on%20screen%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20cream%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20realistic%20remote%20learning%20atmosphere&width=600&height=360&seq=provider-london-met-01&orientation=landscape",
  "cambridge-marketing-college":
    "https://readdy.ai/api/search-image?query=Marketing%20apprenticeship%20creative%20workshop%20with%20young%20learners%20brainstorming%20around%20a%20table%20covered%20in%20brand%20mockups%20and%20mood%20boards%2C%20an%20instructor%20facilitating%20the%20session%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20amber%20tones%20with%20subtle%20teal%20accents%2C%20editorial%20photography%2C%20realistic%20creative%20training%20atmosphere&width=600&height=360&seq=provider-cam-mkt-01&orientation=landscape",
  "cambridge-professional-academy":
    "https://readdy.ai/api/search-image?query=Leadership%20and%20management%20apprenticeship%20coaching%20session%2C%20a%20mentor%20reviewing%20development%20plans%20with%20a%20professional%20learner%20at%20a%20clean%20desk%20in%20a%20modern%20office%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20cream%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20realistic%20professional%20coaching%20atmosphere&width=600&height=360&seq=provider-cam-pro-01&orientation=landscape",
  "jga-group":
    "https://readdy.ai/api/search-image?query=Diverse%20group%20of%20business%20and%20digital%20apprentices%20collaborating%20in%20a%20bright%20modern%20co-working%20training%20space%20with%20laptops%20and%20whiteboards%2C%20energetic%20and%20engaged%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20amber%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20realistic%20professional%20training%20atmosphere&width=600&height=360&seq=provider-jga-01&orientation=landscape",
  "sccu":
    "https://readdy.ai/api/search-image?query=Digital%20and%20creative%20apprenticeship%20studio%20session%2C%20young%20creatives%20working%20on%20design%20and%20content%20projects%20on%20laptops%20in%20a%20modern%20studio%20with%20warm%20ambient%20lighting%2C%20soft%20beige%20and%20cream%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20realistic%20creative%20industry%20atmosphere&width=600&height=360&seq=provider-sccu-01&orientation=landscape",
  "university-cumbria":
    "https://readdy.ai/api/search-image?query=Degree%20apprenticeship%20students%20walking%20across%20a%20modern%20university%20campus%20with%20red%20brick%20and%20glass%20architecture%2C%20golden%20hour%20sunlight%2C%20warm%20beige%20and%20amber%20tones%20with%20subtle%20teal%20accents%2C%20editorial%20photography%2C%20realistic%20higher%20education%20campus%20atmosphere%20with%20soft%20depth%20of%20field&width=600&height=360&seq=provider-cumbria-01&orientation=landscape",
};

function getProviderCategories(providerId: string): string[] {
  const providerStds = getProviderStandards(providerId);
  return categories
    .filter((c) => c.standard_ids.some((sid) => providerStds.some((ps) => ps.standard_id === sid)))
    .map((c) => c.name);
}

function getProviderLevels(providerId: string): number[] {
  const providerStds = getProviderStandards(providerId);
  const levels = providerStds
    .map((ps) => allStandards.find((s) => s.standard_id === ps.standard_id)?.level)
    .filter((l): l is number => typeof l === "number");
  return Array.from(new Set(levels)).sort((a, b) => a - b);
}

export default function FindProvider() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const [locationFilter, setLocationFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "name">("rating");

  const locations = useMemo(
    () => Array.from(new Set(providers.map((p) => p.location.split(",")[0].trim()))).sort(),
    []
  );
  const levels = useMemo(
    () => Array.from(new Set(allStandards.map((s) => s.level))).sort((a, b) => a - b),
    []
  );

  const filteredProviders = useMemo(() => {
    let result = providers.map((p) => {
      const rating = getProviderRating(p.provider_id);
      return {
        ...p,
        overall: rating?.overall ?? 0,
        reviewCount: rating?.review_count ?? 0,
        recommendation: rating?.recommendation_percent ?? 0,
        providerCategories: getProviderCategories(p.provider_id),
        providerLevels: getProviderLevels(p.provider_id),
      };
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.trading_name.toLowerCase().includes(q) ||
          p.legal_name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.UKPRN.includes(q)
      );
    }

    if (locationFilter !== "all") {
      result = result.filter((p) => p.location.toLowerCase().startsWith(locationFilter.toLowerCase()));
    }

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.providerCategories.includes(categoryFilter));
    }

    if (levelFilter !== "all") {
      result = result.filter((p) => p.providerLevels.includes(parseInt(levelFilter)));
    }

    if (ratingFilter !== "all") {
      const minRating = parseFloat(ratingFilter);
      result = result.filter((p) => p.overall >= minRating);
    }

    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.overall - a.overall);
        break;
      case "reviews":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "name":
        result.sort((a, b) => a.trading_name.localeCompare(b.trading_name));
        break;
    }

    return result;
  }, [searchQuery, locationFilter, categoryFilter, levelFilter, ratingFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setLocationFilter("all");
    setCategoryFilter("all");
    setLevelFilter("all");
    setRatingFilter("all");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    locationFilter !== "all" ||
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
              Search and filter apprenticeship training providers by name, location, sector, level, and rating.
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

                  <div className="flex flex-col gap-5">
                    {/* Location */}
                    <div>
                      <label className="text-xs font-semibold text-foreground-500 mb-2 uppercase tracking-wide block">Location</label>
                      <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-background-100 border border-background-200/70 rounded-md text-foreground-900 focus:outline-none focus:border-primary-400 cursor-pointer"
                      >
                        <option value="all">All locations</option>
                        {locations.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

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
                          <option key={c.id} value={c.name}>{c.name}</option>
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
                    <span className="font-semibold text-foreground-800">{filteredProviders.length}</span> provider{filteredProviders.length !== 1 ? "s" : ""} found
                  </p>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-3 py-2 text-sm bg-background-100 border border-background-200/70 rounded-md text-foreground-900 focus:outline-none focus:border-primary-400 cursor-pointer"
                  >
                    <option value="rating">Sort by rating</option>
                    <option value="reviews">Sort by reviews</option>
                    <option value="name">Sort by name</option>
                  </select>
                </div>

                {filteredProviders.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredProviders.map((p, idx) => (
                      <div
                        key={p.provider_id}
                        className="group p-0 bg-background-50 border border-background-200/70 rounded-2xl overflow-hidden hover:border-primary-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(7,27,58,0.06)] transition-all duration-300 flex flex-col"
                      >
                        {/* Provider photo */}
                        <div className="relative h-36 md:h-40 overflow-hidden">
                          <img
                            src={providerPhotos[p.provider_id]}
                            alt={`${p.trading_name} apprenticeship training`}
                            className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background-50/80 via-transparent to-transparent" />
                          {/* Logo badge */}
                          <div className="absolute bottom-3 left-4 w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border border-background-200/70 p-1.5 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                            {p.logoUrl ? (
                              <img
                                src={p.logoUrl}
                                alt={`${p.trading_name} logo`}
                                title={`${p.trading_name} logo`}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span
                                className="text-white text-base font-bold"
                                style={{ backgroundColor: brandColors[idx % brandColors.length] }}
                              >
                                {p.trading_name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1">
                          {/* Name */}
                          <Link
                            to={`/provider/${p.provider_id}`}
                            className="text-sm font-semibold text-foreground-900 hover:text-primary-600 transition-colors line-clamp-1"
                          >
                            {p.trading_name}
                          </Link>
                          <p className="text-xs text-foreground-500 mt-0.5 flex items-center gap-1">
                            <i className="ri-map-pin-line text-[11px]" />
                            {p.location}
                          </p>

                          {/* Rating + reviews */}
                          <div className="flex items-center gap-3 mt-3 mb-3">
                            <StarRating rating={p.overall} size="sm" />
                            <span className="text-sm font-bold text-foreground-900">{p.overall.toFixed(1)}</span>
                            <span className="text-xs text-foreground-500">{p.reviewCount} review{p.reviewCount !== 1 ? "s" : ""}</span>
                          </div>

                          {/* Categories */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {p.providerCategories.slice(0, 3).map((cat) => (
                              <span key={cat} className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full">
                                {cat}
                              </span>
                            ))}
                            {p.providerCategories.length === 0 && (
                              <span className="text-xs text-foreground-400">No sector listed</span>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="mt-auto pt-3 border-t border-background-200/60 flex items-center justify-between">
                            <span className="text-xs text-foreground-500">
                              {p.recommendation}% recommend
                            </span>
                            <Link
                              to={`/provider/${p.provider_id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap"
                            >
                              View Reviews
                              <i className="ri-arrow-right-line text-xs" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
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