import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { providers } from "@/mocks/providers";
import { getProviderScore } from "@/mocks/scores";
import { getProviderReviews } from "@/mocks/reviews";
import { getProviderStandards } from "@/mocks/providerStandards";
import { standards } from "@/mocks/standards";
import { ratingCategories, getProviderRating, getProviderResponse } from "@/mocks/ratings";
import ReviewCard from "./components/ReviewCard";
import ScoreBar, { ScoreCircle } from "./components/ScoreBar";
import StarRating from "@/components/base/StarRating";

function findProvider(rawId: string | undefined) {
  if (!rawId) return null;
  // Try exact match first
  let provider = providers.find((p) => p.provider_id === rawId);
  if (provider) return provider;
  // Try URL-decoded match
  const decoded = decodeURIComponent(rawId);
  provider = providers.find((p) => p.provider_id === decoded);
  if (provider) return provider;
  // Try case-insensitive
  provider = providers.find((p) => p.provider_id.toLowerCase() === decoded.toLowerCase());
  if (provider) return provider;
  // Try matching by trading name slug
  const slug = decoded.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  provider = providers.find((p) => p.provider_id.toLowerCase() === slug);
  return provider || null;
}

function ProviderNotFound({ attemptedId }: { attemptedId: string }) {
  const [search, setSearch] = useState("");

  const suggested = useMemo(() => {
    if (!search.trim()) return providers.slice(0, 6);
    const q = search.toLowerCase();
    return providers.filter(
      (p) =>
        p.trading_name.toLowerCase().includes(q) ||
        p.legal_name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.UKPRN.includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />
      <div className="w-full px-4 md:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-background-100 text-foreground-400 mb-6">
            <i className="ri-search-2-line text-2xl" />
          </div>

          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
            We couldn&apos;t find that provider
          </h1>
          <p className="mt-2 text-foreground-600 text-sm md:text-base">
            The provider <strong className="text-foreground-900">&quot;{attemptedId}&quot;</strong> doesn&apos;t exist in our directory.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-lg mx-auto">
            <div className="relative">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-foreground-400 text-sm" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a provider..."
                className="w-full pl-11 pr-4 py-3 text-sm bg-background-100 border border-background-200/70 rounded-xl text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>
          </div>

          {/* Suggested providers */}
          <div className="mt-8 text-left max-w-lg mx-auto">
            <p className="text-xs font-semibold text-foreground-500 mb-3 uppercase tracking-wider">
              {search.trim() ? "Search results" : "Popular providers to explore"}
            </p>
            <div className="flex flex-col gap-2">
              {suggested.map((p) => (
                <Link
                  key={p.provider_id}
                  to={`/provider/${p.provider_id}`}
                  className="flex items-center justify-between p-4 bg-background-100 border border-background-200/70 rounded-xl hover:border-primary-200 hover:bg-background-50 transition-all"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground-900">{p.trading_name}</p>
                    <p className="text-xs text-foreground-500 mt-0.5">
                      {p.legal_name} · {p.location}
                    </p>
                  </div>
                  <span className="text-xs text-primary-600 font-medium flex items-center gap-1">
                    View profile
                    <i className="ri-arrow-right-line text-xs" />
                  </span>
                </Link>
              ))}
              {suggested.length === 0 && (
                <div className="p-6 bg-background-100 rounded-xl text-center">
                  <p className="text-sm text-foreground-500">No providers match your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/compare"
              className="w-full sm:w-auto px-6 py-3 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors whitespace-nowrap"
            >
              Compare All Providers
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 bg-background-100 text-foreground-700 text-sm font-semibold rounded-full hover:bg-background-200 transition-colors whitespace-nowrap"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ProviderProfile() {
  const { id } = useParams<{ id: string }>();
  const provider = findProvider(id);

  if (!provider) {
    return <ProviderNotFound attemptedId={id || "unknown"} />;
  }

  const score = getProviderScore(provider.provider_id);
  const providerRating = getProviderRating(provider.provider_id);
  const reviews = getProviderReviews(provider.provider_id);
  const providerStds = getProviderStandards(provider.provider_id);
  const matchedStandards = providerStds
    .map((ps) => {
      const std = standards.find((s) => s.standard_id === ps.standard_id);
      return std ? { ...ps, standard: std } : null;
    })
    .filter(Boolean) as Array<{ provider_id: string; standard_id: string; delivery_status: string; evidence_source: string; standard: typeof standards[0] }>;

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* ===== 1. PROVIDER HEADER ===== */}
      <section className="w-full bg-background-50 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-foreground-500 mb-6">
              <Link to="/home" className="hover:text-foreground-700">Home</Link>
              <i className="ri-arrow-right-s-line" />
              <Link to="/compare" className="hover:text-foreground-700">Providers</Link>
              <i className="ri-arrow-right-s-line" />
              <span className="text-foreground-900 font-medium">{provider.trading_name}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                    {provider.trading_name}
                  </h1>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    provider.verification_status === "Verified"
                      ? "bg-primary-50 text-primary-700"
                      : "bg-secondary-50 text-secondary-600"
                  }`}>
                    <i className={`text-xs ${provider.verification_status === "Verified" ? "ri-shield-check-line" : "ri-time-line"}`} />
                    {provider.verification_status}
                  </span>
                </div>
                <p className="text-sm text-foreground-600">{provider.legal_name}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-foreground-600">
                  <span className="flex items-center gap-1.5">
                    <i className="ri-government-line text-foreground-400" />
                    UKPRN: <strong className="text-foreground-800">{provider.UKPRN}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="ri-map-pin-line text-foreground-400" />
                    {provider.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="ri-building-4-line text-foreground-400" />
                    Ofsted: <strong className="text-foreground-800">{provider.Ofsted_status}</strong>
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center lg:items-end gap-2">
                {score && (
                  <ScoreCircle score={score.overall_score} label="Overall Evidence Score" />
                )}
                <Link
                  to={`/compare?providers=${provider.provider_id}`}
                  className="w-full sm:w-auto px-6 py-2.5 bg-background-50 text-foreground-800 text-sm font-semibold rounded-full border border-background-200/70 hover:bg-background-100 transition-colors text-center whitespace-nowrap"
                >
                  Compare this provider
                  <i className="ri-arrow-left-right-line ml-1.5" />
                </Link>
                <Link
                  to="/add-review"
                  className="w-full sm:w-auto px-6 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors text-center whitespace-nowrap"
                >
                  <i className="ri-pencil-line mr-1.5" />
                  Write a Review
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RATING SUMMARY ===== */}
      {providerRating && (
        <section className="w-full bg-background-50 border-b border-background-200/70">
          <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-12">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Overall rating */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center text-center p-6 bg-background-100 rounded-2xl">
                <StarRating rating={providerRating.overall} size="lg" />
                <p className="text-4xl font-heading font-bold text-foreground-950 mt-2">{providerRating.overall.toFixed(1)}</p>
                <p className="text-sm text-foreground-500 mt-1">{providerRating.review_count} verified review{providerRating.review_count !== 1 ? "s" : ""}</p>
                <p className="text-sm font-semibold text-primary-600 mt-2">{providerRating.recommendation_percent}% recommend</p>
              </div>

              {/* Distribution */}
              <div className="lg:col-span-2 flex flex-col justify-center">
                <h3 className="font-heading text-sm font-semibold text-foreground-800 mb-4">Rating distribution</h3>
                <div className="flex flex-col gap-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = providerRating.distribution[star] ?? 0;
                    const pct = providerRating.review_count > 0 ? (count / providerRating.review_count) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-foreground-600 w-9 flex items-center gap-0.5">
                          {star}
                          <i className="ri-star-fill text-primary-500 text-[10px]" />
                        </span>
                        <div className="flex-1 h-2 bg-background-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-foreground-500 w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Category ratings */}
            <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-background-200/60">
              <h3 className="font-heading text-sm font-semibold text-foreground-800 mb-5">Rating categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                {ratingCategories.map((cat) => {
                  const val = providerRating.categories[cat.key] ?? 0;
                  const pct = (val / 5) * 100;
                  return (
                    <div key={cat.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-foreground-600 flex items-center gap-1.5">
                          <i className={`${cat.icon} text-primary-500 text-xs`} />
                          {cat.label}
                        </span>
                        <span className="text-xs font-semibold text-foreground-900">{val.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 bg-background-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== 2. AT-A-GLANCE SUMMARY ===== */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-lg font-semibold text-foreground-950 mb-5">At a Glance</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-background-50 rounded-lg border border-background-200/70">
                <p className="text-xs text-foreground-500 mb-1">Best for</p>
                <p className="text-sm font-semibold text-foreground-900">{provider.best_for[0] || "General"}</p>
              </div>
              <div className="p-4 bg-background-50 rounded-lg border border-background-200/70">
                <p className="text-xs text-foreground-500 mb-1">Matching Standards</p>
                <p className="text-sm font-semibold text-foreground-900">{matchedStandards.length} standards</p>
              </div>
              <div className="p-4 bg-background-50 rounded-lg border border-background-200/70">
                <p className="text-xs text-foreground-500 mb-1">Learner Reviews</p>
                <p className="text-sm font-semibold text-foreground-900">
                  {reviews.learner.length > 0 ? `${reviews.learner.length} review${reviews.learner.length > 1 ? "s" : ""}` : "None yet"}
                </p>
              </div>
              <div className="p-4 bg-background-50 rounded-lg border border-background-200/70">
                <p className="text-xs text-foreground-500 mb-1">Employer Reviews</p>
                <p className="text-sm font-semibold text-foreground-900">
                  {reviews.employer.length > 0 ? `${reviews.employer.length} review${reviews.employer.length > 1 ? "s" : ""}` : "None yet"}
                </p>
              </div>
              <div className="p-4 bg-background-50 rounded-lg border border-background-200/70">
                <p className="text-xs text-foreground-500 mb-1">Delivery Model</p>
                <p className="text-sm font-semibold text-foreground-900">{provider.delivery_model.split(" ")[0]}</p>
              </div>
              <div className="p-4 bg-background-50 rounded-lg border border-background-200/70">
                <p className="text-xs text-foreground-500 mb-1">Last Updated</p>
                <p className="text-sm font-semibold text-foreground-900">{provider.data_last_updated}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. EVIDENCE SCORE BREAKDOWN ===== */}
      <section className="w-full bg-background-50 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="lg:w-1/3">
                <h2 className="font-heading text-xl font-bold text-foreground-950 mb-2">Provider Evidence Score</h2>
                <p className="text-sm text-foreground-600 leading-relaxed mb-4">
                  Scores are calculated using only publicly available and verified evidence. Where data is not available, we do not estimate or guess.
                </p>
                <div className="p-4 bg-secondary-50 dark:bg-secondary-950/40 rounded-lg border border-secondary-100 dark:border-secondary-800/40">
                  <p className="text-xs text-secondary-700 dark:text-secondary-300 font-medium">
                    <i className="ri-information-line mr-1" />
                    Scoring is based on visible public data only. Providers with more publicly available data will show higher scores. Missing data does not indicate poor performance — it indicates data has not yet been made public or verified.
                  </p>
                </div>
              </div>
              <div className="lg:w-2/3 flex flex-col gap-4">
                <ScoreBar label="Learner Experience" score={score?.learner_experience_score ?? 0} weight="30% of overall" />
                <ScoreBar label="Employer Satisfaction" score={score?.employer_satisfaction_score ?? 0} weight="25% of overall" />
                <ScoreBar label="Public Outcomes" score={score?.outcome_score ?? 0} weight="20% of overall" />
                <ScoreBar label="Ofsted / Quality Evidence" score={score?.quality_score ?? 0} weight="15% of overall" />
                <ScoreBar label="Review Confidence" score={score?.confidence_score ?? 0} weight="10% of overall" />
                <div className="mt-2 flex items-center gap-2 text-xs text-foreground-500">
                  <span className="px-2 py-1 bg-background-100 rounded-md">
                    Data confidence: {score?.data_confidence_label ?? "Not Publicly Available"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4. APPRENTICESHIP STANDARDS TABLE ===== */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-xl font-bold text-foreground-950 mb-6">Apprenticeship Standards Offered</h2>
            {matchedStandards.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-background-200 text-left">
                      <th className="py-3 px-4 font-semibold text-foreground-700 text-xs">Standard Name</th>
                      <th className="py-3 px-4 font-semibold text-foreground-700 text-xs hidden sm:table-cell">Level</th>
                      <th className="py-3 px-4 font-semibold text-foreground-700 text-xs hidden md:table-cell">Sector</th>
                      <th className="py-3 px-4 font-semibold text-foreground-700 text-xs">Status</th>
                      <th className="py-3 px-4 font-semibold text-foreground-700 text-xs text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchedStandards.map((ps) => (
                      <tr key={ps.standard_id} className="border-b border-background-100 hover:bg-background-50 transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            to={`/standards/${ps.standard_id}`}
                            className="font-medium text-primary-600 hover:text-primary-700"
                          >
                            {ps.standard.standard_name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-foreground-600 hidden sm:table-cell">
                          <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-md font-medium">
                            Level {ps.standard.level}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-foreground-600 hidden md:table-cell">{ps.standard.sector}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 rounded-md text-xs font-medium">
                            <i className="ri-check-line text-xs" />
                            {ps.delivery_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/compare?providers=${provider.provider_id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap"
                          >
                            Compare
                            <i className="ri-arrow-right-line text-xs" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-foreground-500 py-8 text-center bg-background-100 rounded-lg">
                No apprenticeship standards data available for this provider.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ===== 5. LEARNER REVIEWS ===== */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground-950">Learner Reviews</h2>
                <p className="mt-1 text-sm text-foreground-600">
                  {reviews.learner.length > 0
                    ? `Based on ${reviews.learner.length} learner review${reviews.learner.length > 1 ? "s" : ""}`
                    : "No learner reviews submitted yet."}
                </p>
              </div>
            </div>
            {reviews.learner.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.learner.map((review) => (
                  <ReviewCard key={review.review_id} {...review} reviewerType="learner" />
                ))}
              </div>
            ) : (
              <div className="p-10 bg-background-50 rounded-xl border border-background-200/70 text-center">
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-background-200 text-foreground-400 mb-3">
                  <i className="ri-chat-3-line text-xl" />
                </div>
                <p className="text-sm font-medium text-foreground-700">No verified learner reviews yet.</p>
                <p className="mt-1 text-xs text-foreground-500">Be the first to share your experience.</p>
                <Link
                  to="/add-review"
                  className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors"
                >
                  Add a Review
                  <i className="ri-arrow-right-line" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== 6. EMPLOYER REVIEWS ===== */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground-950">Employer Reviews</h2>
                <p className="mt-1 text-sm text-foreground-600">
                  {reviews.employer.length > 0
                    ? `Based on ${reviews.employer.length} employer review${reviews.employer.length > 1 ? "s" : ""}`
                    : "No employer reviews submitted yet."}
                </p>
              </div>
            </div>
            {reviews.employer.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.employer.map((review) => (
                  <ReviewCard key={review.review_id} {...review} reviewerType="employer" />
                ))}
              </div>
            ) : (
              <div className="p-10 bg-background-100 rounded-xl border border-background-200/70 text-center">
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-background-200 text-foreground-400 mb-3">
                  <i className="ri-building-2-line text-xl" />
                </div>
                <p className="text-sm font-medium text-foreground-700">No verified employer reviews yet.</p>
                <p className="mt-1 text-xs text-foreground-500">Employer feedback helps others choose the right training partner.</p>
                <Link
                  to="/add-review"
                  className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors"
                >
                  Add a Review
                  <i className="ri-arrow-right-line" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== 7. STRENGTHS & WEAKNESSES ===== */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-xl font-bold text-foreground-950 mb-6">Strengths &amp; Areas for Development</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="p-6 bg-background-50 rounded-xl border border-background-200/70">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <i className="ri-thumb-up-line" />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-foreground-900">Strengths</h3>
                </div>
                {provider.strengths.length > 0 ? (
                  <ul className="flex flex-col gap-2.5">
                    {provider.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-foreground-700">
                        <i className="ri-check-line text-primary-500 mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-foreground-500">Not Publicly Available</p>
                )}
              </div>
              {/* Weaknesses */}
              <div className="p-6 bg-background-50 rounded-xl border border-background-200/70">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary-50 text-secondary-600">
                    <i className="ri-error-warning-line" />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-foreground-900">Areas for Development</h3>
                </div>
                {provider.weaknesses.length > 0 ? (
                  <ul className="flex flex-col gap-2.5">
                    {provider.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-foreground-700">
                        <i className="ri-arrow-right-line text-secondary-500 mt-0.5 flex-shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-foreground-500">Not Publicly Available</p>
                )}
              </div>
            </div>

            {/* About provider */}
            <div className="mt-6 p-6 bg-background-50 rounded-xl border border-background-200/70">
              <h3 className="font-heading text-base font-semibold text-foreground-900 mb-3">About {provider.trading_name}</h3>
              <p className="text-sm text-foreground-600 leading-relaxed">{provider.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {provider.best_for.map((bf, i) => (
                  <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                    {bf}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 8. COMPARE CTA ===== */}
      <section className="w-full bg-primary-600">
        <div className="w-full px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to compare {provider.trading_name}?
            </h2>
            <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              See how {provider.trading_name} compares to other providers on evidence scores, reviews, delivery models, and apprenticeship standards.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={`/compare?providers=${provider.provider_id}`}
                className="w-full sm:w-auto px-8 py-3.5 bg-background-50 text-primary-700 text-sm font-semibold rounded-full hover:bg-background-100 transition-colors whitespace-nowrap"
              >
                Compare this provider
                <i className="ri-arrow-left-right-line ml-1.5" />
              </Link>
              <Link
                to="/add-review"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white text-sm font-semibold rounded-full border border-background-50/30 hover:bg-background-50/10 transition-colors whitespace-nowrap"
              >
                Leave a review
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}