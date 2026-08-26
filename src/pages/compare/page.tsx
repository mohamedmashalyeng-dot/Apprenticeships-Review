import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { providers, Provider } from "@/mocks/providers";
import { standards } from "@/mocks/standards";
import { getProviderStandards } from "@/mocks/providerStandards";
import { getProviderScore } from "@/mocks/scores";
import { getProviderReviews } from "@/mocks/reviews";
import { ratingCategories, getProviderRating } from "@/mocks/ratings";
import StarRating from "@/components/base/StarRating";

const priorityOptions = [
  { value: "learner_support", label: "Learner Support" },
  { value: "employer_communication", label: "Employer Communication" },
  { value: "completion_evidence", label: "Completion Evidence" },
  { value: "marketing", label: "Marketing Apprenticeship" },
  { value: "project_management", label: "Project Management" },
  { value: "project_controls", label: "Project Controls" },
];

const compareFields = [
  { key: "trading_name", label: "Provider Name", type: "text" as const },
  { key: "UKPRN", label: "UKPRN", type: "text" as const },
  { key: "legal_name", label: "Legal Entity", type: "text" as const },
  { key: "location", label: "Location", type: "text" as const },
  { key: "Ofsted_status", label: "Ofsted Status", type: "text" as const },
  { key: "delivery_model", label: "Delivery Model", type: "text" as const },
  { key: "verification_status", label: "Verification Status", type: "badge" as const },
];

function getProviderStandardsList(providerId: string): string[] {
  const ps = getProviderStandards(providerId);
  return ps.map((p) => {
    const std = standards.find((s) => s.standard_id === p.standard_id);
    return std ? `${std.standard_name} (Level ${std.level})` : p.standard_id;
  });
}

export default function CompareProviders() {
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get("providers")?.split(",") ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProviders, setSelectedProviders] = useState<string[]>(() =>
    preselected.slice(0, 3).filter((id) => providers.some((p) => p.provider_id === id))
  );
  const [selectedPriority, setSelectedPriority] = useState("learner_support");
  const [showSelector, setShowSelector] = useState(!preselected.length);

  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return providers;
    const q = searchQuery.toLowerCase();
    return providers.filter(
      (p) =>
        p.trading_name.toLowerCase().includes(q) ||
        p.legal_name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.UKPRN.includes(q)
    );
  }, [searchQuery]);

  const selectedProviderObjects = useMemo(
    () => providers.filter((p) => selectedProviders.includes(p.provider_id)),
    [selectedProviders]
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

  const getBestMatch = (): Provider | null => {
    if (selectedProviderObjects.length < 2) return null;
    // Simple heuristic: pick the provider with most standards + verified status
    let best = selectedProviderObjects[0];
    let bestScore = 0;
    for (const p of selectedProviderObjects) {
      const stdCount = getProviderStandards(p.provider_id).length;
      const verified = p.verification_status === "Verified" ? 10 : 0;
      const score = stdCount + verified;
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }
    return best;
  };

  const bestMatch = getBestMatch();

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* Header */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://readdy.ai/api/search-image?query=Two%20professionals%20side%20by%20side%20comparing%20charts%20and%20data%20on%20two%20monitors%20in%20a%20bright%20modern%20workspace%2C%20thoughtful%20collaboration%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20amber%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20high%20detail%2C%20realistic%20analytical%20professional%20atmosphere&width=1800&height=700&seq=compare-hero&orientation=landscape&nocache=true"
            alt="Abstract background representing provider comparison"
            className="w-full h-full object-cover object-top"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {filteredProviders.map((p) => {
                    const isSelected = selectedProviders.includes(p.provider_id);
                    const stdCount = getProviderStandards(p.provider_id).length;
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
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              p.verification_status === "Verified"
                                ? "bg-primary-50 text-primary-700"
                                : "bg-secondary-50 text-secondary-600"
                            }`}
                          >
                            {p.verification_status}
                          </span>
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
                  <tbody>
                    {/* Basic fields */}
                    {compareFields.map((field) => (
                      <tr key={field.key} className="border-t border-background-100 hover:bg-background-50/50">
                        <td className="py-3 px-4 text-xs font-medium text-foreground-600 bg-background-50/50">
                          {field.label}
                        </td>
                        {selectedProviderObjects.map((p) => {
                          const val = (p as Record<string, string>)[field.key] ?? "Not Publicly Available";
                          return (
                            <td key={p.provider_id} className="py-3 px-4">
                              {field.type === "badge" ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                                    val === "Verified"
                                      ? "bg-primary-50 text-primary-700"
                                      : "bg-secondary-50 text-secondary-600"
                                  }`}
                                >
                                  <i
                                    className={`text-xs ${
                                      val === "Verified" ? "ri-shield-check-line" : "ri-time-line"
                                    }`}
                                  />
                                  {val}
                                </span>
                              ) : (
                                <span className="text-xs text-foreground-700">{val}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    {/* Matching Standards */}
                    <tr className="border-t border-background-100 hover:bg-background-50/50">
                      <td className="py-3 px-4 text-xs font-medium text-foreground-600 bg-background-50/50">
                        Matching Standards
                      </td>
                      {selectedProviderObjects.map((p) => {
                        const stds = getProviderStandardsList(p.provider_id);
                        return (
                          <td key={p.provider_id} className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {stds.length > 0 ? (
                                stds.map((s, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-md"
                                  >
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-foreground-400">Not Publicly Available</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Evidence Scores */}
                    <tr className="border-t border-background-200 bg-background-50/50">
                      <td colSpan={(selectedProviderObjects.length + 1) as number} className="py-2 px-4 text-xs font-semibold text-foreground-700">
                        Evidence Scores
                      </td>
                    </tr>
                    {[
                      { key: "learner_experience_score", label: "Learner Experience", weight: "30%" },
                      { key: "employer_satisfaction_score", label: "Employer Satisfaction", weight: "25%" },
                      { key: "outcome_score", label: "Public Outcomes", weight: "20%" },
                      { key: "quality_score", label: "Ofsted / Quality", weight: "15%" },
                      { key: "confidence_score", label: "Review Confidence", weight: "10%" },
                    ].map((scoreField) => (
                      <tr key={scoreField.key} className="border-t border-background-100">
                        <td className="py-3 px-4 text-xs font-medium text-foreground-600 bg-background-50/50">
                          {scoreField.label}
                          <span className="text-foreground-400 ml-1">({scoreField.weight})</span>
                        </td>
                        {selectedProviderObjects.map((p) => {
                          const s = getProviderScore(p.provider_id);
                          const val = s ? (s as Record<string, number>)[scoreField.key] : 0;
                          return (
                            <td key={p.provider_id} className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-background-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary-500 rounded-full"
                                    style={{ width: `${val}%` }}
                                  />
                                </div>
                                <span className="text-xs font-semibold text-foreground-800 w-8 text-right">
                                  {val > 0 ? val : "N/A"}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    {/* Overall Score */}
                    <tr className="border-t border-background-200">
                      <td className="py-3 px-4 text-xs font-semibold text-foreground-800 bg-background-50/50">
                        Overall Evidence Score
                      </td>
                      {selectedProviderObjects.map((p) => {
                        const s = getProviderScore(p.provider_id);
                        return (
                          <td key={p.provider_id} className="py-3 px-4">
                            <span className={`text-sm font-bold ${(s?.overall_score ?? 0) > 0 ? "text-primary-600" : "text-foreground-400"}`}>
                              {(s?.overall_score ?? 0) > 0 ? `${s?.overall_score}/100` : "N/A"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Reviews */}
                    <tr className="border-t border-background-200 bg-background-50/50">
                      <td colSpan={(selectedProviderObjects.length + 1) as number} className="py-2 px-4 text-xs font-semibold text-foreground-700">
                        Reviews
                      </td>
                    </tr>
                    <tr className="border-t border-background-100">
                      <td className="py-3 px-4 text-xs font-medium text-foreground-600 bg-background-50/50">
                        Learner Review Count
                      </td>
                      {selectedProviderObjects.map((p) => {
                        const r = getProviderReviews(p.provider_id);
                        return (
                          <td key={p.provider_id} className="py-3 px-4">
                            <span className="text-xs text-foreground-700">
                              {r.learner.length > 0 ? `${r.learner.length} review${r.learner.length > 1 ? "s" : ""}` : "None yet"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-t border-background-100">
                      <td className="py-3 px-4 text-xs font-medium text-foreground-600 bg-background-50/50">
                        Employer Review Count
                      </td>
                      {selectedProviderObjects.map((p) => {
                        const r = getProviderReviews(p.provider_id);
                        return (
                          <td key={p.provider_id} className="py-3 px-4">
                            <span className="text-xs text-foreground-700">
                              {r.employer.length > 0 ? `${r.employer.length} review${r.employer.length > 1 ? "s" : ""}` : "None yet"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Ratings */}
                    <tr className="border-t border-background-200 bg-background-50/50">
                      <td colSpan={(selectedProviderObjects.length + 1) as number} className="py-2 px-4 text-xs font-semibold text-foreground-700">
                        Ratings &amp; Recommendations
                      </td>
                    </tr>
                    {ratingCategories.map((cat) => (
                      <tr key={cat.key} className="border-t border-background-100">
                        <td className="py-3 px-4 text-xs font-medium text-foreground-600 bg-background-50/50">
                          {cat.label}
                        </td>
                        {selectedProviderObjects.map((p) => {
                          const pr = getProviderRating(p.provider_id);
                          const val = pr?.categories[cat.key] ?? 0;
                          return (
                            <td key={p.provider_id} className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <StarRating rating={val} size="sm" />
                                <span className="text-xs font-semibold text-foreground-800">{val.toFixed(1)}</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr className="border-t border-background-100">
                      <td className="py-3 px-4 text-xs font-medium text-foreground-600 bg-background-50/50">
                        Would recommend
                      </td>
                      {selectedProviderObjects.map((p) => {
                        const pr = getProviderRating(p.provider_id);
                        return (
                          <td key={p.provider_id} className="py-3 px-4">
                            <span className="text-xs font-semibold text-foreground-800">
                              {pr ? `${pr.recommendation_percent}%` : "N/A"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Strengths */}
                    <tr className="border-t border-background-200 bg-background-50/50">
                      <td colSpan={(selectedProviderObjects.length + 1) as number} className="py-2 px-4 text-xs font-semibold text-foreground-700">
                        Strengths &amp; Best For
                      </td>
                    </tr>
                    <tr className="border-t border-background-100">
                      <td className="py-3 px-4 text-xs font-medium text-foreground-600 bg-background-50/50">Strengths</td>
                      {selectedProviderObjects.map((p) => (
                        <td key={p.provider_id} className="py-3 px-4">
                          <ul className="flex flex-col gap-1">
                            {p.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-foreground-700">
                                <i className="ri-check-line text-primary-500 mt-0.5 flex-shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-background-100">
                      <td className="py-3 px-4 text-xs font-medium text-foreground-600 bg-background-50/50">Best for</td>
                      {selectedProviderObjects.map((p) => (
                        <td key={p.provider_id} className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {p.best_for.map((bf, i) => (
                              <span key={i} className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-md">
                                {bf}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Data Confidence */}
                    <tr className="border-t border-background-200">
                      <td className="py-3 px-4 text-xs font-medium text-foreground-600 bg-background-50/50">Data Confidence</td>
                      {selectedProviderObjects.map((p) => {
                        const s = getProviderScore(p.provider_id);
                        return (
                          <td key={p.provider_id} className="py-3 px-4">
                            <span className="text-xs text-foreground-700">
                              {s?.data_confidence_label ?? "Not Publicly Available"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Recommendation Box */}
              {bestMatch && (
                <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-950/40 border border-primary-100/50 dark:border-primary-800/40 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-primary-500 text-white">
                      <i className="ri-flashlight-line text-lg" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-base font-bold text-foreground-950">
                        Best match based on your priorities
                      </h3>
                      <p className="mt-1 text-sm text-foreground-600">
                        Based on available evidence and the selected priority,{" "}
                        <Link to={`/provider/${bestMatch.provider_id}`} className="font-semibold text-primary-600 hover:text-primary-700">
                          {bestMatch.trading_name}
                        </Link>{" "}
                        appears to be the strongest match. This recommendation is based on the number of matching standards, verification status, and available public data.
                      </p>
                    </div>
                    <Link
                      to={`/provider/${bestMatch.provider_id}`}
                      className="flex-shrink-0 px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors whitespace-nowrap"
                    >
                      View full profile
                      <i className="ri-arrow-right-line ml-1.5" />
                    </Link>
                  </div>

                  {/* Priority selector */}
                  <div className="mt-5 pt-5 border-t border-primary-100/50">
                    <p className="text-xs font-medium text-foreground-600 mb-3">
                      Choose your priority to refine the recommendation:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {priorityOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSelectedPriority(opt.value)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                            selectedPriority === opt.value
                              ? "bg-primary-500 text-white"
                              : "bg-background-50 text-foreground-600 border border-background-200 hover:border-primary-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
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
                  className="mt-6 inline-block px-6 py-3 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors"
                >
                  View {selectedProviderObjects[0].trading_name}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Quick links */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10">
          <div className="max-w-6xl mx-auto">
            <h3 className="font-heading text-sm font-semibold text-foreground-700 mb-4">
              Popular comparisons
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ["kent-business-college", "fareport"],
                ["kent-business-college", "oxford-professional"],
                ["cambridge-marketing-college", "cambridge-professional-academy"],
                ["london-met", "jga-group"],
              ].map(([a, b]) => (
                <Link
                  key={`${a}-${b}`}
                  to={`/compare?providers=${a},${b}`}
                  className="flex items-center justify-between p-4 bg-background-50 rounded-2xl border border-background-200/70 hover:border-primary-200 transition-all text-sm"
                >
                  <span className="text-foreground-700 truncate">
                    {providers.find((p) => p.provider_id === a)?.trading_name}
                  </span>
                  <span className="text-xs text-foreground-400 mx-2">vs</span>
                  <span className="text-foreground-700 truncate">
                    {providers.find((p) => p.provider_id === b)?.trading_name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}