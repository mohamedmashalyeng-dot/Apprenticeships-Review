import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import LoadingIndicator from "@/components/base/LoadingIndicator";
import type { Standard, FAQItem } from "@/types/standard";
import type { Provider, ProviderScore } from "@/types/provider";
import type { Review } from "@/types/review";
import { getCompanies } from "@/services/companies.service";
import { getStandardCompanySlugs, getStandardFAQs } from "@/services/standards.service";
import { getReviews, getCompanyReviews, splitByReviewerType } from "@/services/reviews.service";
import StandardProviderCard from "./StandardProviderCard";
import ReviewCard from "@/pages/provider/components/ReviewCard";

// getCompanyScore is a fixed all-zero stub regardless of provider (no real evidence-scoring
// data exists yet) — build it locally instead of firing one request per linked provider.
function emptyScore(providerId: string): ProviderScore {
  return {
    provider_id: providerId,
    learner_experience_score: 0,
    employer_satisfaction_score: 0,
    outcome_score: 0,
    quality_score: 0,
    confidence_score: 0,
    overall_score: 0,
    data_confidence_label: "Not Publicly Available",
  };
}

interface StandardDetailLayoutProps {
  standard: Standard;
}

export default function StandardDetailLayout({ standard }: StandardDetailLayoutProps) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isLoading, setIsLoading] = useState(true);
  const [linkedProviders, setLinkedProviders] = useState<Provider[]>([]);
  const [providerScores, setProviderScores] = useState<Record<string, ProviderScore>>({});
  const [providerReviews, setProviderReviews] = useState<Record<string, { learner: Review[]; employer: Review[] }>>({});
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [reviews, setReviews] = useState<{ learner: Review[]; employer: Review[] }>({ learner: [], employer: [] });

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getStandardCompanySlugs(standard.standard_id),
      getStandardFAQs(standard.standard_id),
      getReviews({}, { standard: standard.standard_id }),
      getCompanies(),
    ])
      .then(async ([slugs, faqData, reviewsResult, allCompanies]) => {
        const matchedProviders = allCompanies.filter((c) => slugs.includes(c.provider_id));
        setLinkedProviders(matchedProviders);
        setFaqs(faqData);
        setReviews(splitByReviewerType(reviewsResult.reviews));

        const scoreMap: Record<string, ProviderScore> = {};
        matchedProviders.forEach((p) => {
          scoreMap[p.provider_id] = emptyScore(p.provider_id);
        });
        setProviderScores(scoreMap);

        // One batched request per linked provider instead of leaving each card to fetch its
        // own reviews on mount.
        const reviewsPerProvider = await Promise.all(matchedProviders.map((p) => getCompanyReviews(p.provider_id)));
        const reviewsMap: Record<string, { learner: Review[]; employer: Review[] }> = {};
        matchedProviders.forEach((p, i) => {
          reviewsMap[p.provider_id] = reviewsPerProvider[i];
        });
        setProviderReviews(reviewsMap);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [standard.standard_id]);

  const allProviderIds = linkedProviders.map((p) => p.provider_id);
  const compareUrl = `/compare?providers=${allProviderIds.slice(0, 3).join(",")}`;

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* ===== HERO / OVERVIEW ===== */}
      <section className="w-full bg-background-50 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-14">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-foreground-500 mb-6">
              <Link to="/home" className="hover:text-foreground-700">Home</Link>
              <i className="ri-arrow-right-s-line" />
              <Link to="/standards" className="hover:text-foreground-700">Apprenticeship Standards</Link>
              <i className="ri-arrow-right-s-line" />
              <span className="text-foreground-900 font-medium">{standard.standard_name}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                    {standard.standard_name}
                  </h1>
                  <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold">
                    Level {standard.level}
                  </span>
                </div>
                <p className="text-sm md:text-base text-foreground-600 leading-relaxed max-w-3xl">
                  {standard.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-foreground-600">
                  <span className="flex items-center gap-1.5">
                    <i className="ri-folder-line text-foreground-400" />
                    Sector: <strong className="text-foreground-800">{standard.sector}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="ri-time-line text-foreground-400" />
                    Duration: <strong className="text-foreground-800">{standard.duration}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="ri-money-pound-circle-line text-foreground-400" />
                    Max Funding: <strong className="text-foreground-800">{standard.max_funding}</strong>
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 flex-shrink-0">
                <Link
                  to={compareUrl}
                  className="btn btn-lg btn-primary"
                >
                  Compare providers for this standard
                  <i className="ri-arrow-left-right-line ml-1.5" />
                </Link>
                <Link
                  to="/add-review"
                  className="btn btn-lg btn-secondary"
                >
                  Add a review
                  <i className="ri-arrow-right-line ml-1.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHO IT'S FOR & TYPICAL PROFILES ===== */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Who it's for */}
              <div className="p-6 bg-background-50 rounded-xl border border-background-200/70">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600 mb-3">
                  <i className="ri-user-search-line" />
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground-900 mb-2">Who it&apos;s for</h3>
                <p className="text-sm text-foreground-600 leading-relaxed">{standard.who_for}</p>
              </div>

              {/* Typical learner */}
              <div className="p-6 bg-background-50 rounded-xl border border-background-200/70">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600 mb-3">
                  <i className="ri-user-star-line" />
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground-900 mb-2">Typical Learner Profile</h3>
                <p className="text-sm text-foreground-600 leading-relaxed">{standard.typical_learner}</p>
              </div>

              {/* Typical employer */}
              <div className="p-6 bg-background-50 rounded-xl border border-background-200/70">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary-50 text-secondary-600 mb-3">
                  <i className="ri-building-2-line" />
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground-900 mb-2">Typical Employer Use Case</h3>
                <p className="text-sm text-foreground-600 leading-relaxed">{standard.typical_employer}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROVIDERS ===== */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground-950">
                  Training Providers
                </h2>
                <p className="mt-1 text-sm text-foreground-600">
                  {linkedProviders.length} provider{linkedProviders.length !== 1 ? "s" : ""} delivering this standard
                </p>
              </div>
              <div className="flex items-center gap-1 bg-background-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === "cards"
                      ? "bg-background-50 text-foreground-900 shadow-sm"
                      : "text-foreground-500 hover:text-foreground-700"
                  }`}
                >
                  <i className="ri-layout-grid-line mr-1" />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === "table"
                      ? "bg-background-50 text-foreground-900 shadow-sm"
                      : "text-foreground-500 hover:text-foreground-700"
                  }`}
                >
                  <i className="ri-table-line mr-1" />
                  Table
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="py-10 bg-background-100 rounded-xl">
                <LoadingIndicator />
              </div>
            ) : linkedProviders.length > 0 ? (
              <>
                {viewMode === "cards" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {linkedProviders.map((p) => (
                      <StandardProviderCard
                        key={p.provider_id}
                        provider={p}
                        score={providerScores[p.provider_id] ?? null}
                        reviews={providerReviews[p.provider_id] ?? { learner: [], employer: [] }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-background-200 text-left">
                          <th className="py-3 px-4 font-semibold text-foreground-700 text-xs">Provider Name</th>
                          <th className="py-3 px-4 font-semibold text-foreground-700 text-xs hidden sm:table-cell">UKPRN</th>
                          <th className="py-3 px-4 font-semibold text-foreground-700 text-xs hidden md:table-cell">Location</th>
                          <th className="py-3 px-4 font-semibold text-foreground-700 text-xs hidden md:table-cell">Evidence Level</th>
                          <th className="py-3 px-4 font-semibold text-foreground-700 text-xs hidden lg:table-cell">Learner Reviews</th>
                          <th className="py-3 px-4 font-semibold text-foreground-700 text-xs text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {linkedProviders.map((p) => {
                          const s = providerScores[p.provider_id];
                          return (
                            <tr
                              key={p.provider_id}
                              className="border-b border-background-100 hover:bg-background-50 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div>
                                  <Link
                                    to={`/provider/${p.provider_id}`}
                                    className="font-medium text-primary-600 hover:text-primary-700 text-sm"
                                  >
                                    {p.trading_name}
                                  </Link>
                                  <p className="text-xs text-foreground-500 mt-0.5">{p.legal_name}</p>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-foreground-600 text-xs hidden sm:table-cell">
                                {p.UKPRN}
                              </td>
                              <td className="py-3 px-4 text-foreground-600 text-xs hidden md:table-cell">
                                {p.location}
                              </td>
                              <td className="py-3 px-4 hidden md:table-cell">
                                <span className="text-xs text-foreground-600">
                                  {s?.data_confidence_label ?? "Not Publicly Available"}
                                </span>
                              </td>
                              <td className="py-3 px-4 hidden lg:table-cell">
                                <span className="text-xs text-foreground-600">
                                  {reviews.learner.length > 0 ? `${reviews.learner.length} review${reviews.learner.length > 1 ? "s" : ""}` : "None"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Link
                                  to={`/compare?providers=${p.provider_id}`}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap"
                                >
                                  Compare
                                  <i className="ri-arrow-right-line text-xs" />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-foreground-500 py-10 text-center bg-background-100 rounded-xl">
                No providers currently listed for this standard.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ===== REVIEW HIGHLIGHTS ===== */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="font-heading text-xl font-bold text-foreground-950">Review Highlights</h2>
              <p className="mt-1 text-sm text-foreground-600">
                Learner and employer reviews for {standard.standard_name} across all providers.
              </p>
            </div>

            {isLoading ? (
              <div className="p-10 bg-background-50 rounded-xl border border-background-200/70">
                <LoadingIndicator />
              </div>
            ) : reviews.learner.length > 0 || reviews.employer.length > 0 ? (
              <div className="space-y-6">
                {/* Learner reviews */}
                {reviews.learner.length > 0 && (
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-foreground-700 mb-3">
                      Learner Reviews ({reviews.learner.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reviews.learner.map((r) => (
                        <ReviewCard key={r.review_id} {...r} reviewerType="learner" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Employer reviews */}
                {reviews.employer.length > 0 && (
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-foreground-700 mb-3">
                      Employer Reviews ({reviews.employer.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reviews.employer.map((r) => (
                        <ReviewCard key={r.review_id} {...r} reviewerType="employer" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-10 bg-background-50 rounded-xl border border-background-200/70 text-center">
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-background-200 text-foreground-400 mb-3">
                  <i className="ri-chat-3-line text-xl" />
                </div>
                <p className="text-sm font-medium text-foreground-700">No reviews yet for this standard.</p>
                <p className="mt-1 text-xs text-foreground-500">
                  Be the first to share your experience — your review helps future learners and employers.
                </p>
                <Link
                  to="/add-review"
                  className="btn btn-md btn-primary mt-4"
                >
                  Add a Review
                  <i className="ri-arrow-right-line" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-xl font-bold text-foreground-950 mb-6">
              Frequently Asked Questions
            </h2>
            {isLoading ? (
              <div className="py-8 bg-background-100 rounded-xl">
                <LoadingIndicator />
              </div>
            ) : faqs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group bg-background-100 rounded-xl border border-background-200/70 overflow-hidden transition-all duration-200"
                  >
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                      <span className="text-sm font-medium text-foreground-800 pr-4">
                        {faq.question}
                      </span>
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-background-200 text-foreground-500 group-open:bg-primary-100 group-open:text-primary-600 transition-colors">
                        <i className="ri-add-line text-sm group-open:hidden" />
                        <i className="ri-subtract-line text-sm hidden group-open:block" />
                      </span>
                    </summary>
                    <div className="px-5 pb-4">
                      <p className="text-sm text-foreground-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground-500 py-8 text-center bg-background-100 rounded-xl">
                No FAQs available for this standard yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ===== COMPARE CTA ===== */}
      <section className="w-full bg-primary-600">
        <div className="w-full px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
              Compare providers for this standard
            </h2>
            <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              See how training providers compare side by side on evidence scores, delivery models, reviews, and outcomes for {standard.standard_name} Level {standard.level}.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={compareUrl}
                className="btn btn-lg btn-inverse w-full sm:w-auto"
              >
                Compare providers
                <i className="ri-arrow-left-right-line ml-1.5" />
              </Link>
              <Link
                to="/standards"
                className="btn btn-lg btn-glass w-full sm:w-auto"
              >
                Browse all standards
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}