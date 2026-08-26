import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import StarRating from "@/components/base/StarRating";
import ReportReviewModal from "@/components/feature/ReportReviewModal";
import { learnerReviews, employerReviews } from "@/mocks/reviews";
import { providers } from "@/mocks/providers";
import { ratingCategories } from "@/mocks/ratings";
import { getProviderResponse } from "@/mocks/ratings";
import { standards, additionalStandards } from "@/mocks/standards";

const allReviews = [...learnerReviews, ...employerReviews];
const allStandards = [...standards, ...additionalStandards];

function getReviewCategoryRatings(reviewId: string, overall: number): Record<string, number> {
  let hash = 0;
  for (let i = 0; i < reviewId.length; i++) hash = (hash * 31 + reviewId.charCodeAt(i)) % 100;
  return ratingCategories.reduce((acc, cat, idx) => {
    const offset = ((hash + idx * 7) % 5) / 5 - 0.4;
    acc[cat.key] = Math.max(1, Math.min(5, Math.round((overall + offset) * 2) / 2));
    return acc;
  }, {} as Record<string, number>);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function ReviewDetails() {
  const { id } = useParams<{ id: string }>();
  const [showReport, setShowReport] = useState(false);
  const [helpful, setHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(12);

  const review = allReviews.find((r) => r.review_id === id);
  const provider = review ? providers.find((p) => p.provider_id === review.provider_id) : null;
  const standard = review ? allStandards.find((s) => s.standard_id === review.standard_id) : null;
  const response = review ? getProviderResponse(review.review_id) : null;

  if (!review) {
    return (
      <div className="min-h-screen bg-background-50">
        <Navbar />
        <div className="w-full px-4 md:px-6 lg:px-8 py-24">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-2xl bg-background-100 text-foreground-400 mb-4">
              <i className="ri-search-line text-xl" />
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground-950 mb-2">Review not found</h1>
            <p className="text-sm text-foreground-600 mb-6">We couldn't find the review you were looking for.</p>
            <Link to="/providers" className="px-6 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors whitespace-nowrap">
              Browse providers
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryRatings = getReviewCategoryRatings(review.review_id, review.rating);

  const toggleHelpful = () => {
    setHelpful((prev) => {
      const next = !prev;
      setHelpfulCount((c) => c + (next ? 1 : -1));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-foreground-500 mb-6">
              <Link to="/home" className="hover:text-foreground-700">Home</Link>
              <i className="ri-arrow-right-s-line" />
              {provider && (
                <>
                  <Link to={`/provider/${provider.provider_id}`} className="hover:text-foreground-700">{provider.trading_name}</Link>
                  <i className="ri-arrow-right-s-line" />
                </>
              )}
              <span className="text-foreground-900 font-medium">Review</span>
            </div>

            {/* Review card */}
            <div className="p-6 md:p-8 bg-background-50 border border-background-200/70 rounded-2xl">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-primary-50 text-primary-600 font-bold text-sm">
                    {review.reviewer_type === "learner" ? "AP" : "EM"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground-900">
                      {review.reviewer_type === "learner" ? "Apprentice" : "Employer"}
                    </p>
                    <p className="text-xs text-foreground-500">
                      {review.reviewer_type === "learner"
                        ? review.programme_studied || "Apprenticeship"
                        : review.employer_type || "Employer"}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  review.verification_status === "Verified"
                    ? "bg-primary-50 text-primary-700"
                    : "bg-secondary-50 text-secondary-600"
                }`}>
                  <i className={`text-xs ${review.verification_status === "Verified" ? "ri-shield-check-line" : "ri-time-line"}`} />
                  {review.verification_status === "Verified" ? "Verified Apprentice" : review.verification_status}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={review.rating} size="lg" />
                <span className="text-2xl font-bold text-foreground-900">{review.rating.toFixed(1)}</span>
              </div>

              {/* Title + text */}
              <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground-950 mb-3">
                {review.review_title}
              </h1>
              <p className="text-base text-foreground-700 leading-relaxed">{review.review_text}</p>

              {/* Meta */}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-foreground-500">
                <span className="flex items-center gap-1.5">
                  <i className="ri-calendar-line" />
                  {formatDate(review.review_date)}
                </span>
                {provider && (
                  <Link to={`/provider/${provider.provider_id}`} className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700">
                    <i className="ri-building-4-line" />
                    {provider.trading_name}
                  </Link>
                )}
                {standard && (
                  <span className="flex items-center gap-1.5">
                    <i className="ri-file-list-3-line" />
                    {standard.standard_name} Level {standard.level}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 pt-5 border-t border-background-200/60 flex flex-wrap items-center gap-3">
                <button
                  onClick={toggleHelpful}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    helpful
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-background-200/70 text-foreground-600 hover:border-primary-300"
                  }`}
                >
                  <i className={`${helpful ? "ri-thumb-up-fill" : "ri-thumb-up-line"}`} />
                  Helpful ({helpfulCount})
                </button>
                <button
                  onClick={() => setShowReport(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-background-200/70 text-sm font-medium text-foreground-600 hover:border-red-300 hover:text-red-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-flag-line" />
                  Report
                </button>
              </div>
            </div>

            {/* Rating breakdown */}
            <div className="mt-6 p-6 bg-background-100 border border-background-200/70 rounded-2xl">
              <h2 className="font-heading text-base font-semibold text-foreground-900 mb-4">Rating breakdown</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {ratingCategories.map((cat) => (
                  <div key={cat.key} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-foreground-700">{cat.label}</span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={categoryRatings[cat.key]} size="sm" />
                      <span className="text-sm font-semibold text-foreground-900">{categoryRatings[cat.key].toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Provider response */}
            {response && (
              <div className="mt-6 p-6 bg-background-50 border border-primary-200/60 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-500 text-white">
                    <i className="ri-building-4-line" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground-900">Response from {provider?.trading_name}</p>
                    <p className="text-xs text-foreground-500">{response.responder} · {response.role}</p>
                  </div>
                </div>
                <p className="text-sm text-foreground-700 leading-relaxed">{response.text}</p>
                <p className="mt-3 text-xs text-foreground-400">{formatDate(response.date)}</p>
              </div>
            )}

            {/* Write your own */}
            <div className="mt-8 p-6 bg-primary-600 rounded-2xl text-center">
              <h2 className="font-heading text-lg md:text-xl font-bold text-white mb-2">
                Had a similar experience?
              </h2>
              <p className="text-primary-100 text-sm mb-4">Share your own review to help other apprentices choose better.</p>
              <Link
                to="/add-review"
                className="inline-flex items-center gap-2 px-6 py-3 bg-background-50 text-primary-700 text-sm font-semibold rounded-full hover:bg-background-100 transition-colors whitespace-nowrap"
              >
                Write a Review
                <i className="ri-arrow-right-line" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {showReport && (
        <ReportReviewModal
          reviewId={review.review_id}
          reviewTitle={review.review_title}
          onClose={() => setShowReport(false)}
        />
      )}

      <Footer />
    </div>
  );
}