import { useEffect, useState, type FormEvent } from "react";
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
    }, 2000);
    return () => window.clearInterval(interval);
  }, [reviews.length]);

  const featuredReview = reviews[reviewIndex] ?? FALLBACK_REVIEW;
  const reviewerName = featuredReview.reviewer_name || (featuredReview.reviewer_type === "employer" ? "Employer reviewer" : "Apprentice reviewer");
  const reviewerInitials = reviewerName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const reviewTitle = featuredReview.review_title || featuredReview.review_text;
  const reviewText = featuredReview.review_text && featuredReview.review_text !== reviewTitle
    ? featuredReview.review_text
    : "Real experience from an apprenticeship provider review.";
  const reviewLabel = featuredReview.programme_studied || featuredReview.standard_id.replaceAll("-", " ");

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    navigate(`/providers?${params}`);
  }

  return (
    <section className="relative isolate min-h-[43rem] overflow-hidden bg-[#f2f8ff]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(74,166,255,0.2),transparent_34%),linear-gradient(rgba(31,112,190,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(31,112,190,0.055)_1px,transparent_1px)] bg-[size:auto,42px_42px,42px_42px]" />
        <div className="absolute -right-24 top-10 h-[34rem] w-[34rem] rounded-full border border-primary-200/70" />
        <div className="absolute right-16 top-28 h-[27rem] w-[27rem] rounded-full border border-primary-200/60" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[0.94fr_1.06fr] lg:gap-12">
          <div className="order-2 lg:order-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfe4f7] bg-white px-3.5 py-2 text-xs font-medium text-[#53718c] shadow-sm">
              <span className="tracking-[0.2em] text-primary-500">★★★★★</span><strong className="text-[#0b2340]">4.8</strong><span>from 12,600+ verified reviews</span>
            </div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">Independent. Transparent. Built for better choices.</p>
            <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight text-[#071b36] md:text-5xl lg:text-6xl">
              Find an apprenticeship provider
              <br />
              <span className="text-primary-600">you can trust.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#496783] md:text-lg">
              Compare learner and employer experiences, verified outcomes and apprenticeship standards, all in one clear, independent place.
            </p>

            <form onSubmit={search} role="search" className="mt-8">
              <label htmlFor="home-provider-search" className="sr-only">Search provider, standard or career</label>
              <div className="flex flex-col gap-2 rounded-2xl border border-[#d7e8f8] bg-white p-2 shadow-[0_16px_40px_rgba(31,112,190,0.12)] sm:flex-row focus-within:ring-2 focus-within:ring-primary-500">
                <input
                  id="home-provider-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search provider, standard or career"
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-foreground-900 outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                >
                  Search <i className="ri-arrow-right-line ml-2" />
                </button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-[#66819a]">
              <span>Popular:</span>
              {["Marketing", "Project management", "Digital", "Engineering"].map((tag) => (
                <Link key={tag} to="/providers" className="rounded-full border border-[#cfe4f7] bg-white/80 px-3.5 py-2 text-[#52718d] shadow-sm transition hover:border-primary-300 hover:text-primary-600">{tag}</Link>
              ))}
            </div>
          </div>

          <div className="relative z-10 order-1 hidden min-h-[30rem] md:block lg:order-2" aria-label="Review highlights">
            <div className="pointer-events-none absolute -left-14 top-36 hidden flex-col items-center text-center text-[11px] font-semibold leading-[1.35] tracking-wide text-primary-600 sm:flex">
              <img src="/better-choices-callout.svg" alt="Better choices. Brighter futures." className="h-auto w-32" />
            </div>
            <div className="pointer-events-none absolute right-2 bottom-20 hidden flex-col items-center text-center text-[11px] font-semibold leading-[1.35] tracking-wide text-[#58739e] sm:flex">
              <span className="rounded-xl border border-primary-100 bg-white/75 px-3 py-2 shadow-sm">Real people.<br />Real progress.</span>
              <i className="ri-arrow-down-line mt-1 rotate-[35deg] text-xl text-primary-400" />
            </div>
            <div className="absolute -left-2 top-10 hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/90 bg-white/90 text-xl text-[#53718c] shadow-[0_12px_28px_rgba(31,112,190,0.12)] backdrop-blur-sm sm:flex">
              <i className="ri-group-line" aria-hidden="true" />
            </div>
            <div className="absolute right-8 bottom-2 hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/90 bg-white/90 text-xl text-primary-500 shadow-[0_12px_28px_rgba(31,112,190,0.12)] backdrop-blur-sm sm:flex">
              <i className="ri-bar-chart-fill" aria-hidden="true" />
            </div>
            <span className="absolute right-[16%] top-5 hidden h-2.5 w-2.5 rounded-full border-2 border-white bg-primary-400 shadow-[0_0_0_3px_rgba(74,166,255,0.16)] sm:block" />
            <div key={featuredReview.review_id} className="absolute left-[12%] top-[12%] z-10 flex h-[20rem] w-[68%] flex-col overflow-hidden rounded-3xl border border-white bg-white/95 p-6 shadow-[0_24px_60px_rgba(31,112,190,0.16)] backdrop-blur-sm transition-opacity duration-500 md:p-7">
              <div className="flex items-center justify-between gap-3 text-xs text-[#66819a]"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e1f5fa] font-semibold text-[#168a9a]">{reviewerInitials}</span><span><strong className="block text-sm text-[#0b2340]">{reviewerName}</strong>{featuredReview.reviewer_type === "employer" ? "Employer review" : "Apprentice review"}</span></div><span className="rounded-full bg-[#e8f4ff] px-3 py-1 text-[11px] font-medium text-primary-600"><i className="ri-checkbox-circle-fill mr-1" aria-hidden="true" />Verified</span></div>
              <p className="mt-6 text-sm tracking-[0.2em] text-primary-500">{"★".repeat(Math.max(1, Math.min(5, Math.round(featuredReview.rating))))}{"☆".repeat(Math.max(0, 5 - Math.round(featuredReview.rating)))}</p>
              <p className="mt-2 line-clamp-3 text-xl font-semibold leading-snug text-[#0b2340] md:text-2xl">“{reviewTitle}”</p>
              <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-[#66819a]">{reviewText}</p>
              <div className="mt-auto flex items-center justify-between border-t border-background-200 pt-3 text-xs text-[#66819a]"><span className="capitalize"><i className="ri-graduation-cap-line mr-1" />{reviewLabel}</span><span>{featuredReview.review_date ? new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(new Date(featuredReview.review_date)) : "Recent review"}</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
