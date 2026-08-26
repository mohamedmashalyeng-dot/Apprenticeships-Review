import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { learnerReviews, employerReviews } from "@/mocks/reviews";
import { providers } from "@/mocks/providers";
import { standards, additionalStandards } from "@/mocks/standards";
import ReviewCard from "@/pages/provider/components/ReviewCard";
import type { Review } from "@/mocks/reviews";

const allReviews: Review[] = [...learnerReviews, ...employerReviews];
const allStandards = [...standards, ...additionalStandards];

type ReviewerFilter = "all" | "learner" | "employer";
type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1";

export default function Reviews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewerFilter, setReviewerFilter] = useState<ReviewerFilter>("all");
  const [standardFilter, setStandardFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");

  const filteredReviews = useMemo(() => {
    let result = [...allReviews];

    if (reviewerFilter !== "all") {
      result = result.filter((r) => r.reviewer_type === reviewerFilter);
    }

    if (standardFilter !== "all") {
      result = result.filter((r) => r.standard_id === standardFilter);
    }

    if (providerFilter !== "all") {
      result = result.filter((r) => r.provider_id === providerFilter);
    }

    if (ratingFilter !== "all") {
      result = result.filter((r) => r.rating === parseInt(ratingFilter));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.review_title.toLowerCase().includes(query) ||
          r.review_text.toLowerCase().includes(query) ||
          (r.programme_studied && r.programme_studied.toLowerCase().includes(query)) ||
          (r.employer_type && r.employer_type.toLowerCase().includes(query)) ||
          r.review_tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    switch (sortBy) {
      case "highest":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        result.sort((a, b) => a.rating - b.rating);
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime());
        break;
    }

    return result;
  }, [searchQuery, reviewerFilter, standardFilter, providerFilter, ratingFilter, sortBy]);

  const avgRating =
    allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : "0.0";

  const learnerCount = learnerReviews.length;
  const employerCount = employerReviews.length;
  const verifiedCount = allReviews.filter((r) => r.verification_status === "Verified").length;

  const getProviderName = (id: string) => {
    const p = providers.find((pr) => pr.provider_id === id);
    return p ? p.trading_name : id;
  };

  const getStandardName = (id: string) => {
    const s = allStandards.find((st) => st.standard_id === id);
    return s ? s.standard_name : id;
  };

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://readdy.ai/api/search-image?query=Professionals%20sharing%20feedback%20and%20reviews%20around%20a%20table%20with%20laptops%20and%20coffee%20in%20a%20bright%20modern%20office%2C%20candid%20collaborative%20discussion%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20amber%20tones%20with%20teal%20accents%2C%20editorial%20photography%2C%20shallow%20depth%20of%20field%2C%20high%20detail%2C%20realistic%20authentic%20professional%20atmosphere&width=1800&height=700&seq=reviews-hero&orientation=landscape&nocache=true"
            alt="Abstract background representing reviews"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 pt-24 pb-14 md:pt-32 md:pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-3">
                  Provider Reviews
                </p>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
                  Browse verified learner &amp; employer reviews
                </h1>
                <p className="mt-3 text-white/90 text-sm md:text-base max-w-2xl">
                  Read genuine reviews from apprentices and employers who have experienced apprenticeship
                  training first-hand. All reviews are subject to verification.
                </p>
              </div>
              <Link
                to="/add-review"
                className="inline-flex items-center gap-2 whitespace-nowrap px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors"
              >
                <i className="ri-pencil-line text-base" />
                Add a Review
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="w-full px-4 md:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-background-50 border border-background-200/70 rounded-2xl text-center">
              <p className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">
                {allReviews.length}
              </p>
              <p className="text-xs text-foreground-500 mt-1">Total Reviews</p>
            </div>
            <div className="p-4 bg-background-50 border border-background-200/70 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">
                  {avgRating}
                </span>
                <i className="ri-star-fill text-primary-500 text-lg" />
              </div>
              <p className="text-xs text-foreground-500 mt-1">Average Rating</p>
            </div>
            <div className="p-4 bg-background-50 border border-background-200/70 rounded-2xl text-center">
              <p className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">
                {learnerCount}
              </p>
              <p className="text-xs text-foreground-500 mt-1">Learner Reviews</p>
            </div>
            <div className="p-4 bg-background-50 border border-background-200/70 rounded-2xl text-center">
              <p className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">
                {employerCount}
              </p>
              <p className="text-xs text-foreground-500 mt-1">Employer Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="w-full px-4 md:px-6 lg:px-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 p-4 bg-background-50 border border-background-200/70 rounded-2xl">
            {/* Search + sort row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 text-sm" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reviews by keyword, programme, or provider..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-background-100 border border-background-200/70 rounded-full text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 text-sm bg-background-100 border border-background-200/70 rounded-md text-foreground-900 focus:outline-none focus:border-primary-400 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>

            {/* Filter chips row */}
            <div className="flex flex-wrap gap-2">
              {/* Reviewer type */}
              <div className="flex gap-1">
                {(["all", "learner", "employer"] as ReviewerFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setReviewerFilter(f)}
                    className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                      reviewerFilter === f
                        ? "bg-primary-500 text-white"
                        : "bg-background-100 text-foreground-600 hover:bg-background-200"
                    }`}
                  >
                    {f === "all" ? "All Reviewers" : f === "learner" ? "Learners" : "Employers"}
                  </button>
                ))}
              </div>

              <span className="w-px h-6 bg-background-200 self-center" />

              {/* Rating filter */}
              <div className="flex gap-1">
                {(["all", "5", "4", "3", "2", "1"] as RatingFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setRatingFilter(f)}
                    className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                      ratingFilter === f
                        ? "bg-primary-500 text-white"
                        : "bg-background-100 text-foreground-600 hover:bg-background-200"
                    }`}
                  >
                    {f === "all" ? "All Ratings" : f}
                    {f !== "all" && <i className="ri-star-fill text-[10px]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Standard + provider dropdowns */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={standardFilter}
                onChange={(e) => setStandardFilter(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-background-100 border border-background-200/70 rounded-md text-foreground-900 focus:outline-none focus:border-primary-400 cursor-pointer"
              >
                <option value="all">All Apprenticeship Standards</option>
                {allStandards.map((s) => (
                  <option key={s.standard_id} value={s.standard_id}>
                    {s.standard_name} Level {s.level}
                  </option>
                ))}
              </select>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-background-100 border border-background-200/70 rounded-md text-foreground-900 focus:outline-none focus:border-primary-400 cursor-pointer"
              >
                <option value="all">All Providers</option>
                {providers.map((p) => (
                  <option key={p.provider_id} value={p.provider_id}>
                    {p.trading_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="w-full px-4 md:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-foreground-500 mb-4">
            Showing {filteredReviews.length} review{filteredReviews.length !== 1 ? "s" : ""}
            {searchQuery && ` for "${searchQuery}"`}
          </p>

          {filteredReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReviews.map((review) => (
                <div key={review.review_id} className="group relative">
                  <Link
                    to={`/provider/${review.provider_id}`}
                    className="absolute top-3 right-3 z-10 text-xs text-primary-600 hover:text-primary-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View Provider <i className="ri-arrow-right-line text-[10px]" />
                  </Link>
                  <ReviewCard
                    key={review.review_id}
                    rating={review.rating}
                    reviewerType={review.reviewer_type}
                    review_title={review.review_title}
                    review_text={review.review_text}
                    review_tags={review.review_tags}
                    verification_status={review.verification_status}
                    programme_studied={review.programme_studied}
                    employer_type={review.employer_type}
                    review_date={review.review_date}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-14 bg-background-50 border border-background-200/70 rounded-2xl text-center">
              <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-background-100 text-foreground-400 mb-4">
                <i className="ri-search-line text-2xl" />
              </div>
              <p className="text-sm font-medium text-foreground-700">No reviews match your filters</p>
              <p className="text-xs text-foreground-500 mt-1">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setReviewerFilter("all");
                  setStandardFilter("all");
                  setProviderFilter("all");
                  setRatingFilter("all");
                  setSortBy("newest");
                }}
                className="mt-4 px-4 py-2 text-xs font-medium bg-background-100 text-foreground-600 rounded-full hover:bg-background-200 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Review policy callout */}
      <section className="w-full px-4 md:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="p-6 bg-primary-50 dark:bg-primary-950/40 border border-primary-100/50 dark:border-primary-800/40 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-primary-50 text-primary-500">
                <i className="ri-shield-check-line text-lg" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-foreground-900">
                  Our review integrity commitment
                </h3>
                <p className="text-xs text-foreground-600 mt-1 leading-relaxed">
                  All reviews on ApprenticeshipsReviews are subject to verification. We do not publish
                  fake reviews, paid reviews, or manipulated ratings. Reviews labelled &quot;Pending
                  Verification&quot; are sample/demo content used to demonstrate the review structure.
                  Read our full{" "}
                  <Link to="/review-policy" className="text-primary-600 hover:text-primary-700 underline">
                    review policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full px-4 md:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="p-10 md:p-14 bg-primary-500 rounded-2xl text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
              Share your apprenticeship experience
            </h2>
            <p className="mt-3 text-primary-100 text-sm md:text-base max-w-xl mx-auto">
              Help future learners and employers make better decisions by leaving a verified review of
              your apprenticeship provider.
            </p>
            <Link
              to="/add-review"
              className="mt-6 inline-flex items-center gap-2 whitespace-nowrap px-6 py-3 bg-background-50 text-primary-600 text-sm font-semibold rounded-full hover:bg-background-100 transition-colors cursor-pointer"
            >
              <i className="ri-pencil-line text-base" />
              Add a Review
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}