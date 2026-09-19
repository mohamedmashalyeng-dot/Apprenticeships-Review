import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReviewerAvatar from "@/components/base/ReviewerAvatar";
import StarRating from "@/components/base/StarRating";
import { getCompanies } from "@/services/companies.service";
import { getReviews } from "@/services/reviews.service";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

interface SampleReview {
  id: string;
  name: string;
  type: string;
  rating: number;
  title: string;
  text: string;
  provider: string;
  date: string;
}

function ReviewCard({ review }: { review: SampleReview }) {
  return (
    <div
      data-review-card
      className="flex-shrink-0 w-[85%] rounded-2xl border border-background-200/60 bg-background-50 p-5 shadow-[0_1px_6px_rgba(7,27,58,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-background-300/50 hover:shadow-[0_4px_16px_rgba(7,27,58,0.06)] sm:w-[360px] lg:w-[calc((100%-2rem)/3)]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <ReviewerAvatar name={review.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-foreground-900">{review.name}</p>
            <p className="text-xs text-foreground-500">{review.type}</p>
          </div>
        </div>
        <span className="rounded-full bg-background-100 px-2 py-0.5 text-xs font-medium text-foreground-600">Source: website</span>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <StarRating rating={review.rating} size="sm" />
        <span className="text-xs font-semibold text-foreground-700">{review.rating.toFixed(1)} out of 5</span>
      </div>

      <p className="mb-1.5 line-clamp-1 text-sm font-semibold text-foreground-800">{review.title}</p>
      <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-foreground-600">{review.text}</p>

      <div className="flex items-center justify-between gap-3 border-t border-background-200/50 pt-3">
        <span className="max-w-[140px] truncate text-xs text-foreground-500">{review.provider}</span>
        <span className="text-xs text-foreground-500">{review.date}</span>
      </div>
      <Link to={`/review/${review.id}`} className="mt-3 inline-flex text-xs font-semibold text-primary-600 hover:text-primary-700">
        Read full review
      </Link>
    </div>
  );
}

export default function RecentReviewsSection({ active = true, onReady }: { active?: boolean; onReady?: () => void } = {}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [reviews, setReviews] = useState<SampleReview[]>([]);
  const positionRef = useRef(0);
  const halfWidthRef = useRef(0);
  const manualTargetRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    Promise.all([getReviews({ sortBy: "newest", limit: 9 }), getCompanies()])
      .then(([{ reviews: recent }, companies]) => {
        const companyBySlug = new Map(companies.map((c) => [c.provider_id, c]));
        setReviews(
          recent.map((r) => {
            const company = r.provider_id ? companyBySlug.get(r.provider_id) : undefined;
            return {
              id: r.review_id,
              name: r.reviewer_name?.trim() || "Anonymous",
              type: r.reviewer_type === "learner" ? "Apprentice" : "Employer",
              rating: r.rating,
              title: r.review_title,
              text: r.review_text,
              provider: company?.trading_name ?? r.pending_provider_name ?? "Training provider",
              date: formatRelativeTime(r.review_date),
            };
          })
        );
      })
      .catch(() => setReviews([]))
      .finally(() => onReady?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reviews.length === 0) return;

    halfWidthRef.current = track.scrollWidth / 2;

    let lastTime = 0;
    const speed = 40;

    const step = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const half = halfWidthRef.current;

      if (manualTargetRef.current !== null) {
        const target = manualTargetRef.current;
        const diff = target - positionRef.current;
        if (Math.abs(diff) < 0.5) {
          positionRef.current = target;
          manualTargetRef.current = null;
        } else {
          positionRef.current += diff * Math.min(1, delta * 8);
        }
      } else if (!isPaused) {
        positionRef.current += speed * delta;
      }

      if (half > 0) {
        positionRef.current = ((positionRef.current % half) + half) % half;
      }

      track.style.transform = `translate3d(${-positionRef.current}px, 0, 0)`;
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused, reviews]);

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    const half = halfWidthRef.current;
    if (!track || half <= 0) return;
    const card = track.querySelector<HTMLElement>("[data-review-card]");
    const step = card ? card.offsetWidth + 16 : 360;
    const base = manualTargetRef.current ?? positionRef.current;
    manualTargetRef.current = ((base + direction * step) % half + half) % half;
  };

  if (reviews.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-background-50">
      <div className="w-full px-4 py-12 md:px-6 md:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-3xl">Recent apprenticeship reviews</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground-500 md:text-base">
                Read recent feedback about apprenticeship training. Check each review's source and date, and read the full review for context.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scroll(-1)}
                  aria-label="Previous reviews"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-background-200/70 text-foreground-600 transition-all duration-200 hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-600"
                >
                  <i className="ri-arrow-left-line text-base" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll(1)}
                  aria-label="Next reviews"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-background-200/70 text-foreground-600 transition-all duration-200 hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-600"
                >
                  <i className="ri-arrow-right-line text-base" />
                </button>
              </div>

              <Link to="/reviews" className="whitespace-nowrap text-sm font-medium text-primary-500 transition-colors hover:text-primary-600">
                Read all reviews
              </Link>
              <Link to="/add-review" className="whitespace-nowrap text-sm font-medium text-foreground-700 transition-colors hover:text-primary-600">
                Write a review
              </Link>
            </div>
          </div>

          <div className="relative">
            <div
              ref={scrollRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="overflow-hidden"
            >
              <div ref={trackRef} className="flex gap-4 will-change-transform">
                {[...reviews, ...reviews].map((review, index) => (
                  <ReviewCard key={`${review.id}-${index}`} review={review} />
                ))}
              </div>
            </div>

            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 md:w-20 lg:w-28"
              style={{ background: "linear-gradient(to right, oklch(var(--background-50)), oklch(var(--background-50) / 0))" }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 md:w-20 lg:w-28"
              style={{ background: "linear-gradient(to left, oklch(var(--background-50)), oklch(var(--background-50) / 0))" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
