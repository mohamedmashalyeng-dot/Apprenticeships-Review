import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import LoadingIndicator from "@/components/base/LoadingIndicator";
import ReviewCard from "@/pages/provider/components/ReviewCard";
import { getReviews, splitByReviewerType } from "@/services/reviews.service";
import { getCompanies, getPlatformStats } from "@/services/companies.service";
import { getStandards } from "@/services/standards.service";
import type { Review } from "@/types/review";
import type { Provider } from "@/types/provider";
import type { Standard } from "@/types/standard";

type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1";

const REVIEWS_PAGE_SIZE = 9;

function ReviewGroup({ title, reviews, emptyMessage }: { title: string; reviews: Review[]; emptyMessage: string }) {
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PAGE_SIZE);

  // Reset back to the first page whenever the underlying (filtered) review set changes.
  useEffect(() => {
    setVisibleCount(REVIEWS_PAGE_SIZE);
  }, [reviews]);

  const visibleReviews = reviews.slice(0, visibleCount);

  return (
    <div>
      <h2 className="font-heading text-lg font-bold text-foreground-900 mb-4">
        {title} <span className="text-foreground-400 font-normal text-sm">({reviews.length})</span>
      </h2>
      {reviews.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleReviews.map((review) => (
              <div key={review.review_id} className="flex flex-col gap-2 h-full">
                <ReviewCard
                  rating={review.rating}
                  reviewerType={review.reviewer_type}
                  reviewer_name={review.reviewer_name}
                  review_title={review.review_title}
                  review_text={review.review_text}
                  review_tags={review.review_tags}
                  verification_status={review.verification_status}
                  programme_studied={review.programme_studied}
                  employer_type={review.employer_type}
                  review_date={review.review_date}
                />
                <Link
                  to={`/provider/${review.provider_id}`}
                  className="self-end text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Provider <i className="ri-arrow-right-line text-[10px]" />
                </Link>
              </div>
            ))}
          </div>
          {visibleCount < reviews.length && (
            <div className="flex justify-center mt-5">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + REVIEWS_PAGE_SIZE)}
                className="px-5 py-2.5 bg-background-50 border border-background-200/70 text-sm font-semibold text-primary-500 rounded-full hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-600 transition-all duration-200 cursor-pointer"
              >
                Load more ({reviews.length - visibleCount} more)
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-foreground-500">{emptyMessage}</p>
      )}
    </div>
  );
}

export default function Reviews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [standardFilter, setStandardFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [allStandards, setAllStandards] = useState<Standard[]>([]);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [learnerCount, setLearnerCount] = useState(0);
  const [employerCount, setEmployerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // One-off data for the filter dropdowns and the (unfiltered) stats strip — all server-computed
  // aggregates over the full review set, not just whatever page happens to be loaded below.
  useEffect(() => {
    Promise.all([getCompanies(), getStandards(), getPlatformStats()]).then(
      ([companies, standardsList, platformStats]) => {
        setProviders(companies);
        setAllStandards(standardsList);
        setTotalReviewsCount(platformStats.totalReviews);
        setAvgRating(platformStats.averageRating);
        setLearnerCount(platformStats.learnerReviews);
        setEmployerCount(platformStats.employerReviews);
      }
    );
  }, []);

  // Server-side filtering/sorting for the params the API supports.
  useEffect(() => {
    setIsLoading(true);
    getReviews(
      {
        rating: ratingFilter !== "all" ? parseInt(ratingFilter) : undefined,
        sortBy,
        limit: 200,
      },
      {
        standard: standardFilter !== "all" ? standardFilter : undefined,
        company: providerFilter !== "all" ? providerFilter : undefined,
      }
    )
      .then((result) => setReviews(result.reviews))
      .finally(() => setIsLoading(false));
  }, [ratingFilter, sortBy, standardFilter, providerFilter]);

  // Free-text search isn't supported by the API's filter params, so it's applied client-side
  // on top of the already server-filtered/sorted response.
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

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

    return result;
  }, [reviews, searchQuery]);

  const { learner: learnerReviews, employer: employerReviews } = useMemo(
    () => splitByReviewerType(filteredReviews),
    [filteredReviews]
  );

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/c48fd67eb7fb4d3d8ee0b39bb8f6ee2c.png"
            alt="Abstract background representing reviews"
            width={467}
            height={313}
            className="site-image-hero"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-24">
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

            {/* Stats strip */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl text-center">
                <p className="text-2xl md:text-3xl font-heading font-bold text-white">
                  {totalReviewsCount}
                </p>
                <p className="text-xs text-white/70 mt-1">Total Reviews</p>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl md:text-3xl font-heading font-bold text-white">
                    {avgRating.toFixed(1)}
                  </span>
                  <i className="ri-star-fill text-primary-400 text-lg" />
                </div>
                <p className="text-xs text-white/70 mt-1">Average Rating</p>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl text-center">
                <p className="text-2xl md:text-3xl font-heading font-bold text-white">
                  {learnerCount}
                </p>
                <p className="text-xs text-white/70 mt-1">Learner Reviews</p>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl text-center">
                <p className="text-2xl md:text-3xl font-heading font-bold text-white">
                  {employerCount}
                </p>
                <p className="text-xs text-white/70 mt-1">Employer Reviews</p>
              </div>
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

          {isLoading ? (
            <div className="py-16">
              <LoadingIndicator />
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="flex flex-col gap-10">
              <ReviewGroup
                title="Learner Reviews"
                reviews={learnerReviews}
                emptyMessage="No learner reviews match your filters."
              />
              <ReviewGroup
                title="Employer Reviews"
                reviews={employerReviews}
                emptyMessage="No employer reviews match your filters yet."
              />
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
