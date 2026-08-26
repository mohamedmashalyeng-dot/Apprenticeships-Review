import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { standards, additionalStandards } from "@/mocks/standards";
import { getStandardProviders } from "@/mocks/providerStandards";
import { getStandardReviews } from "@/mocks/reviews";

const allStandards = [...standards, ...additionalStandards];

const sectors = Array.from(new Set(allStandards.map((s) => s.sector))).sort();

const levels = Array.from(new Set(allStandards.map((s) => s.level))).sort((a, b) => a - b);

export default function Standards() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  const toggleLevel = (level: number) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLevels([]);
    setSelectedSectors([]);
  };

  const hasActiveFilters = searchQuery.trim() !== "" || selectedLevels.length > 0 || selectedSectors.length > 0;

  const filteredStandards = useMemo(() => {
    return allStandards.filter((s) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          s.standard_name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      // Level filter
      if (selectedLevels.length > 0 && !selectedLevels.includes(s.level)) return false;
      // Sector filter
      if (selectedSectors.length > 0 && !selectedSectors.includes(s.sector)) return false;
      return true;
    });
  }, [searchQuery, selectedLevels, selectedSectors]);

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://readdy.ai/api/search-image?query=A%20team%20of%20professionals%20collaborating%20to%20review%20certification%20standards%20and%20documents%20on%20a%20large%20screen%20in%20a%20modern%20office%2C%20focused%20teamwork%2C%20warm%20natural%20light%2C%20soft%20cream%20and%20amber%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20high%20detail%2C%20realistic%20professional%20atmosphere&width=1800&height=700&seq=standards-hero&orientation=landscape&nocache=true"
            alt="Abstract background representing apprenticeship standards"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
              Apprenticeship Standards
            </h1>
            <p className="mt-3 text-sm md:text-base text-white/90 max-w-2xl">
              Browse and compare all apprenticeship standards. Each standard page shows which providers deliver it, reviews, funding information, and FAQs to help you make an informed decision.
            </p>

            {/* Search */}
            <div className="mt-6 relative max-w-xl">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-400">
                <i className="ri-search-line" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by standard name, sector, or keyword..."
                className="w-full pl-10 pr-4 py-3 bg-background-50/95 border border-background-50/30 rounded-full text-sm text-foreground-900 placeholder:text-foreground-400 outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-200 transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters + Results */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <div className="lg:w-56 flex-shrink-0">
                <div className="lg:sticky lg:top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-sm font-semibold text-foreground-800">Filters</h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Level filter */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-foreground-500 mb-2 uppercase tracking-wide">Level</p>
                    <div className="flex flex-wrap gap-1.5">
                      {levels.map((level) => (
                        <button
                          key={level}
                          onClick={() => toggleLevel(level)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                            selectedLevels.includes(level)
                              ? "bg-primary-500 text-white"
                              : "bg-background-100 text-foreground-600 hover:bg-background-200"
                          }`}
                        >
                          Level {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sector filter */}
                  <div>
                    <p className="text-xs font-semibold text-foreground-500 mb-2 uppercase tracking-wide">Sector</p>
                    <div className="flex flex-col gap-1">
                      {sectors.map((sector) => (
                        <label
                          key={sector}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-background-100 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSectors.includes(sector)}
                            onChange={() => toggleSector(sector)}
                            className="w-3.5 h-3.5 rounded border-background-300 text-primary-500 focus:ring-primary-300 cursor-pointer"
                          />
                          <span className="text-xs text-foreground-700">{sector}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-foreground-600">
                    <span className="font-semibold text-foreground-800">{filteredStandards.length}</span> standard{filteredStandards.length !== 1 ? "s" : ""} found
                    {hasActiveFilters && <span className="text-foreground-400"> (filtered)</span>}
                  </p>
                </div>

                {filteredStandards.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredStandards.map((s) => {
                      const providerCount = getStandardProviders(s.standard_id).length;
                      const reviews = getStandardReviews(s.standard_id);
                      const totalReviews = reviews.learner.length + reviews.employer.length;

                      return (
                        <Link
                          key={s.standard_id}
                          to={`/standards/${s.standard_id}`}
                          className="group p-5 bg-background-100 border border-background-200/70 rounded-2xl hover:border-primary-200 hover:bg-background-50 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="min-w-0">
                              <h3 className="font-heading text-base font-semibold text-foreground-900 group-hover:text-primary-600 transition-colors">
                                {s.standard_name}
                              </h3>
                            </div>
                            <span className="flex-shrink-0 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold">
                              Level {s.level}
                            </span>
                          </div>
                          <p className="text-sm text-foreground-600 leading-relaxed line-clamp-2 mb-4">
                            {s.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-foreground-500">
                            <span className="flex items-center gap-1">
                              <i className="ri-folder-line" />
                              {s.sector}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-time-line" />
                              {s.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-building-4-line" />
                              {providerCount} provider{providerCount !== 1 ? "s" : ""}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-chat-3-line" />
                              {totalReviews > 0 ? `${totalReviews} review${totalReviews > 1 ? "s" : ""}` : "No reviews yet"}
                            </span>
                          </div>
                          <div className="mt-4 pt-3 border-t border-background-200/70 flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground-700">
                              Max funding: {s.max_funding}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-primary-600 group-hover:text-primary-700 transition-colors whitespace-nowrap">
                              View providers
                              <i className="ri-arrow-right-line text-xs group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-2xl bg-background-100 text-foreground-400 mb-4">
                      <i className="ri-search-line text-xl" />
                    </div>
                    <p className="text-sm font-medium text-foreground-700 mb-1">No standards match your filters</p>
                    <p className="text-xs text-foreground-500 mb-4">Try adjusting your search or clearing the filters.</p>
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors"
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

      {/* Quick CTA */}
      <section className="w-full bg-primary-600">
        <div className="w-full px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
              Not sure which standard to choose?
            </h2>
            <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Browse our learner and employer guides to understand what to look for in an apprenticeship training provider, or start comparing providers directly.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/help"
                className="w-full sm:w-auto px-8 py-3.5 bg-background-50 text-primary-700 text-sm font-semibold rounded-full hover:bg-background-100 transition-colors whitespace-nowrap"
              >
                Guide for learners
                <i className="ri-arrow-right-line ml-1.5" />
              </Link>
              <Link
                to="/help"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white text-sm font-semibold rounded-full border border-background-50/30 hover:bg-background-50/10 transition-colors whitespace-nowrap"
              >
                Guide for employers
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}