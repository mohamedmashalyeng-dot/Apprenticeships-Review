import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import StarRating from "@/components/base/StarRating";
import LoadingIndicator from "@/components/base/LoadingIndicator";
import ReviewerAvatar from "@/components/base/ReviewerAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { getReviews, updateReviewResponse } from "@/services/reviews.service";
import { getRatingCategories, getCompanyStats } from "@/services/ratings.service";
import { getCompanyBySlug } from "@/services/companies.service";
import { getCompanyStandards, getStandards, resolveStandards } from "@/services/standards.service";
import type { Review } from "@/types/review";
import type { ProviderRating, RatingCategory } from "@/types/rating";
import type { Provider } from "@/types/provider";
import type { Standard } from "@/types/standard";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [ratingCategories, setRatingCategories] = useState<RatingCategory[]>([]);
  const [company, setCompany] = useState<Provider | null>(null);
  const [rating, setRating] = useState<ProviderRating | null>(null);
  const [matchedStandards, setMatchedStandards] = useState<Standard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const slug = user?.managedCompanySlug ?? null;

  const loadReviews = useCallback(() => {
    if (!slug) return Promise.resolve();
    return getReviews({ limit: 200 }, { company: slug }).then(({ reviews }) => setAllReviews(reviews));
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }
    Promise.all([
      loadReviews(),
      getRatingCategories().then(setRatingCategories),
      getCompanyBySlug(slug).then(setCompany),
      getCompanyStats(slug).then(setRating),
      Promise.all([getCompanyStandards(slug), getStandards()]).then(([links, allStandards]) => {
        setMatchedStandards(resolveStandards(links, allStandards).map((r) => r.standard));
      }),
    ])
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [slug, loadReviews]);

  if (!user) return null;

  const providerId = slug ?? "";

  const submitResponse = (reviewId: string) => {
    updateReviewResponse(reviewId, {
      text: responseText,
      by: user.displayName,
      role: "Company representative",
    })
      .then(() => loadReviews())
      .catch(console.error)
      .finally(() => {
        setRespondingTo(null);
        setResponseText("");
      });
  };

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* Header */}
      <section className="w-full bg-background-50 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-10">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary-500 text-white font-bold text-lg overflow-hidden">
                {company?.logoUrl ? (
                  <img src={company.logoUrl} alt={`${company.trading_name} logo`} className="w-full h-full object-contain bg-white" />
                ) : (
                  (company?.trading_name ?? "Your company").split(" ").map((w) => w[0]).slice(0, 2).join("")
                )}
              </div>
              <div>
                <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground-950">
                  {company?.trading_name ?? "Your company"}
                </h1>
                <p className="text-sm text-foreground-500 flex items-center gap-1.5">
                  <i className="ri-shield-check-line text-primary-500" />
                  {company?.verification_status === "Verified" ? "Verified provider" : "Provider"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to={`/provider/${providerId}`} className="px-5 py-2.5 bg-background-100 text-foreground-700 text-sm font-semibold rounded-full hover:bg-background-200 transition-colors whitespace-nowrap">
                View public profile
              </Link>
              <Link to="/provider-dashboard/edit" className="px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors whitespace-nowrap">
                Manage profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="w-full bg-background-100 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-6">
          <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-background-50 border border-background-200/70 rounded-2xl">
              <p className="text-xs text-foreground-500 mb-1">Overall rating</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-heading font-bold text-foreground-950">{(rating?.overall ?? 0).toFixed(1)}</span>
                <StarRating rating={rating?.overall ?? 0} size="sm" />
              </div>
            </div>
            <div className="p-5 bg-background-50 border border-background-200/70 rounded-2xl">
              <p className="text-xs text-foreground-500 mb-1">Total reviews</p>
              <p className="text-2xl font-heading font-bold text-foreground-950">{rating?.review_count ?? 0}</p>
            </div>
            <div className="p-5 bg-background-50 border border-background-200/70 rounded-2xl">
              <p className="text-xs text-foreground-500 mb-1">Recommendation</p>
              <p className="text-2xl font-heading font-bold text-foreground-950">
                {rating?.recommendation_percent != null ? `${rating.recommendation_percent}%` : "No data"}
              </p>
            </div>
            <div className="p-5 bg-background-50 border border-background-200/70 rounded-2xl">
              <p className="text-xs text-foreground-500 mb-1">Programmes</p>
              <p className="text-2xl font-heading font-bold text-foreground-950">{matchedStandards.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: category performance + programmes */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              {/* Category performance */}
              <div className="p-6 bg-background-100 border border-background-200/70 rounded-2xl">
                <h2 className="font-heading text-base font-semibold text-foreground-900 mb-4">Rating category performance</h2>
                <div className="flex flex-col gap-3.5">
                  {ratingCategories.map((cat) => {
                    const val = rating?.categories[cat.key] ?? 0;
                    const pct = (val / 5) * 100;
                    return (
                      <div key={cat.key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-foreground-600">{cat.shortLabel}</span>
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

              {/* Programmes */}
              <div className="p-6 bg-background-100 border border-background-200/70 rounded-2xl">
                <h2 className="font-heading text-base font-semibold text-foreground-900 mb-4">Apprenticeship programmes</h2>
                <div className="flex flex-col gap-2.5">
                  {matchedStandards.map((s) => (
                    <div key={s!.standard_id} className="flex items-center justify-between gap-2">
                      <span className="text-sm text-foreground-700">{s!.standard_name}</span>
                      <span className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full whitespace-nowrap">Level {s!.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: recent reviews */}
            <div className="lg:col-span-2">
              <h2 className="font-heading text-lg font-bold text-foreground-900 mb-5">Recent reviews</h2>
              <div className="flex flex-col gap-4">
                {isLoading ? (
                  <LoadingIndicator />
                ) : allReviews.length > 0 ? (
                  allReviews.map((review) => (
                    <div key={review.review_id} className="p-5 bg-background-50 border border-background-200/70 rounded-2xl">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <ReviewerAvatar name={review.reviewer_name} size="sm" />
                          <span className="text-sm font-semibold text-foreground-900">
                            {review.reviewer_name?.trim() || "Anonymous"}
                          </span>
                        </div>
                        <span className="text-xs text-foreground-400">{review.review_date}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-sm font-bold text-foreground-900">{review.rating.toFixed(1)}</span>
                        <span className="text-xs text-foreground-500">
                          · {review.reviewer_type === "learner" ? "Apprentice" : "Employer"}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground-900 mb-1">{review.review_title}</h3>
                      <p className="text-sm text-foreground-600 leading-relaxed">{review.review_text}</p>

                      {/* Respond */}
                      {respondingTo === review.review_id ? (
                        <div className="mt-4">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            maxLength={500}
                            rows={3}
                            placeholder="Write your public response..."
                            className="w-full px-4 py-3 text-sm bg-background-100 border border-background-200/70 rounded-lg text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors resize-none"
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => submitResponse(review.review_id)} className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap">
                              Post response
                            </button>
                            <button onClick={() => setRespondingTo(null)} className="px-4 py-2 text-sm text-foreground-500 hover:text-foreground-700 cursor-pointer whitespace-nowrap">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : review.response_text ? (
                        <div className="mt-4 p-3 bg-background-100 border border-background-200/60 rounded-lg">
                          <p className="text-xs font-semibold text-foreground-700 mb-1">
                            Response from {review.response_by} · {review.response_role}
                          </p>
                          <p className="text-sm text-foreground-600 leading-relaxed">{review.response_text}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingTo(review.review_id)}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-message-2-line" />
                          Respond publicly
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 bg-background-100 rounded-2xl text-center">
                    <p className="text-sm text-foreground-500">No reviews yet.</p>
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