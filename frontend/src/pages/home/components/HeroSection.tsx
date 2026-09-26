import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getReviews } from "@/services/reviews.service";
import type { Review } from "@/types/review";

const FALLBACK_REVIEW: Review = {
  review_id: "hero-fallback",
  provider_id: null,
  standard_id: "business-administrator",
  reviewer_type: "learner",
  reviewer_name: "Emily M.",
  rating: 5,
  review_title: "The support, structure and real-world experience gave me the confidence to build my future.",
  review_text: "Brilliant communication, knowledgeable trainers and genuine career progression opportunities.",
  verification_status: "Verified",
  review_tags: [],
  review_date: "",
};

const POPULAR_SEARCHES = [
  { label: "Marketing", href: "/providers?category=sales-marketing" },
  { label: "Project management", href: "/providers?category=leadership-management" },
  { label: "Digital", href: "/providers?q=software" },
  { label: "Engineering", href: "/providers?q=engineering" },
];

const headingStyle: CSSProperties = {
  fontSize: "clamp(2.2rem, 6.4vw, 5.35rem)",
  lineHeight: 0.94,
  maxWidth: "11ch",
};

const searchShellStyle: CSSProperties = {
  boxShadow: "0 18px 46px rgba(31,112,190,0.14)",
};

const reviewCardStyle: CSSProperties = {
  borderRadius: "1.35rem",
  boxShadow: "0 24px 60px rgba(31,112,190,0.16)",
  height: "23rem",
  left: "18%",
  maxWidth: "72%",
  top: "8%",
  width: "25rem",
};

function RatingStars({ rating }: { rating: number }) {
  const filled = Math.max(1, Math.min(5, Math.round(rating)));

  return (
    <span className="inline-flex items-center gap-0.5 text-primary-500" aria-label={`${filled} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <i key={index} className={index < filled ? "ri-star-fill text-sm" : "ri-star-line text-sm"} />
      ))}
    </span>
  );
}

export default function HeroSection({ onReady }: { onReady?: () => void } = {}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    let active = true;
    getReviews({ rating: 5, limit: 5, sortBy: "highest" })
      .then(({ reviews: latestReviews }) => {
        if (active) setReviews(latestReviews.filter((review) => review.review_text || review.review_title));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (reviews.length < 2) return;
    const interval = window.setInterval(() => {
      setReviewIndex((current) => (current + 1) % reviews.length);
    }, 3500);
    return () => window.clearInterval(interval);
  }, [reviews.length]);

  const featuredReview = reviews[reviewIndex] ?? FALLBACK_REVIEW;
  const reviewerName =
    featuredReview.reviewer_name || (featuredReview.reviewer_type === "employer" ? "Employer reviewer" : "Apprentice reviewer");
  const reviewerInitials = reviewerName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const reviewTitle = featuredReview.review_title || featuredReview.review_text;
  const reviewText =
    featuredReview.review_text && featuredReview.review_text !== reviewTitle
      ? featuredReview.review_text
      : "Real experience from an apprenticeship provider review.";
  const reviewLabel = featuredReview.programme_studied || featuredReview.standard_id?.replaceAll("-", " ") || "Apprenticeship review";
  const reviewDate = featuredReview.review_date
    ? new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(new Date(featuredReview.review_date))
    : "Recent review";

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    navigate(`/providers${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#f3f9ff] dark:bg-[#05122b]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="site-grid-layer absolute inset-0" />
        <div className="site-glow-layer absolute inset-0" />
        <div className="absolute -right-20 top-8 rounded-full border border-primary-200/60 dark:border-white/10" style={{ height: "30rem", width: "30rem" }} />
        <div className="absolute right-20 top-24 rounded-full border border-primary-200/45 dark:border-white/10" style={{ height: "23rem", width: "23rem" }} />
      </div>

      <div
        className="relative z-10 mx-auto grid w-full items-center gap-10 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-2 lg:gap-8"
        style={{ maxWidth: "88rem", minHeight: "42rem", overflowX: "hidden" }}
      >
        <div className="hero-copy min-w-0 max-w-xl">
          <div
            className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-[#cfe3f7] bg-white/85 px-3.5 py-2 text-xs font-semibold text-[#55728e] shadow-md backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-white/65"
          >
            <RatingStars rating={5} />
            <strong className="text-[#0b2340] dark:text-white">4.8</strong>
            <span className="truncate">from 12,600+ verified reviews</span>
          </div>

          <p className="mb-5 max-w-full text-xs font-bold uppercase leading-relaxed tracking-wider text-primary-600 sm:tracking-widest">
            Independent. Transparent. Built for better choices.
          </p>

          <h1 className="font-heading font-black tracking-tight text-[#071b36] dark:text-white" style={headingStyle}>
            Find an apprenticeship provider
            <span className="block text-primary-600">you can trust.</span>
          </h1>

          <p className="mt-6 max-w-full text-base font-medium leading-relaxed text-[#55708c] dark:text-white/70 md:max-w-lg md:text-lg">
            Compare real learner and employer reviews, apprenticeship standards and provider profiles in one clear, independent place.
          </p>

          <form onSubmit={search} role="search" className="mt-8 w-full max-w-full">
            <label htmlFor="home-provider-search" className="sr-only">
              Search provider, standard or career
            </label>
            <div
              className="flex w-full flex-col gap-2 overflow-hidden rounded-2xl border border-[#d6e8f8] bg-white p-2 dark:border-white/15 dark:bg-white/10 sm:flex-row focus-within:ring-2 focus-within:ring-primary-500"
              style={searchShellStyle}
            >
              <div className="relative min-w-0 flex-1">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#8aa3ba] dark:text-white/45" aria-hidden="true" />
                <input
                  id="home-provider-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search provider, standard or career"
                  className="min-w-0 w-full bg-transparent py-3 pl-10 pr-3 text-sm font-medium text-foreground-900 outline-none placeholder:text-foreground-400 dark:text-white dark:placeholder:text-white/45"
                />
              </div>
              <button
                type="submit"
                className="btn btn-lg btn-primary w-full sm:w-auto"
              >
                Search <i className="ri-arrow-right-line" aria-hidden="true" />
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#66819a] dark:text-white/55">
            <span>Popular:</span>
            {POPULAR_SEARCHES.map((tag) => (
              <Link
                key={tag.label}
                to={tag.href}
                className="rounded-full border border-[#cfe4f7] bg-white/80 px-3.5 py-2 text-[#52718d] shadow-sm transition hover:border-primary-300 hover:text-primary-600 dark:border-white/15 dark:bg-white/10 dark:text-white/70 dark:hover:border-primary-400 dark:hover:text-primary-300"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative hidden min-h-[31rem] md:block" aria-label="Review highlights">
          <div
            className="absolute top-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/90 bg-white/90 text-xl text-[#53718c] shadow-lg backdrop-blur-sm dark:border-white/15 dark:bg-white/10 dark:text-white/70"
            style={{ left: "8%" }}
          >
            <i className="ri-group-line" aria-hidden="true" />
          </div>

          <span className="absolute top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary-400 dark:border-[#05122b]" style={{ boxShadow: "0 0 0 3px rgba(74,166,255,0.16)", right: "17%" }} />

          <div className="absolute z-10 flex flex-col overflow-hidden border border-white bg-white/95 p-7 backdrop-blur-sm dark:border-white/15 dark:bg-[#0b1d3a]/90" style={reviewCardStyle}>
            <div className="flex items-center justify-between gap-3 text-xs text-[#66819a] dark:text-white/55">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dff4f8] font-bold text-[#168a9a] dark:bg-cyan-300/15 dark:text-cyan-200">
                  {reviewerInitials}
                </span>
                <span className="min-w-0">
                  <strong className="block truncate text-sm text-[#0b2340] dark:text-white">{reviewerName}</strong>
                  {featuredReview.reviewer_type === "employer" ? "Employer review" : "Apprentice review"}
                </span>
              </div>
              <span className="shrink-0 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-600">
                <i className="ri-checkbox-circle-fill mr-1" aria-hidden="true" />
                Verified
              </span>
            </div>

            <div className="mt-7">
              <RatingStars rating={featuredReview.rating} />
            </div>

            <p className="mt-4 line-clamp-3 text-2xl font-bold leading-snug text-[#0b2340] dark:text-white">"{reviewTitle}"</p>
            <p className="mt-5 line-clamp-2 text-sm font-medium leading-relaxed text-[#66819a] dark:text-white/60">{reviewText}</p>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-background-200 pt-4 text-xs font-semibold text-[#66819a] dark:border-white/10 dark:text-white/55">
              <span className="min-w-0 truncate capitalize">
                <i className="ri-graduation-cap-line mr-1" aria-hidden="true" />
                {reviewLabel}
              </span>
              <span className="shrink-0">{reviewDate}</span>
            </div>
          </div>

          <img
            src="/better-choices-callout.svg"
            alt="Better choices. Brighter futures."
            className="absolute h-auto w-24"
            style={{ left: "4%", top: "39%" }}
          />

          <div
            className="absolute bottom-24 z-20 flex flex-col items-center text-center text-xs font-bold leading-tight text-[#58739e] dark:text-white/70"
            style={{ right: "3%" }}
          >
            <span className="rounded-xl border border-primary-100 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm dark:border-white/15 dark:bg-white/10">
              Real people.
              <br />
              Real progress.
            </span>
            <i className="ri-arrow-down-line mt-1 rotate-[35deg] text-xl text-primary-400" aria-hidden="true" />
          </div>

          <div
            className="absolute bottom-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/90 bg-white/90 text-xl text-primary-500 shadow-lg backdrop-blur-sm dark:border-white/15 dark:bg-white/10 dark:text-primary-300"
            style={{ right: "6%" }}
          >
            <i className="ri-bar-chart-fill" aria-hidden="true" />
          </div>

          <div className="absolute bottom-4 grid grid-cols-3 gap-3 text-center" style={{ left: "8%" }}>
            {[
              ["12.6k+", "reviews"],
              ["Verified", "signals"],
              ["Standards", "mapped"],
            ].map(([value, label]) => (
              <div key={value} className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/15 dark:bg-white/10">
                <p className="text-sm font-black text-[#0b2340] dark:text-white">{value}</p>
                <p className="mt-0.5 text-xs font-semibold text-[#66819a] dark:text-white/55">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
