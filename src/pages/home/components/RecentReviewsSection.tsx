import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "@/components/base/StarRating";
import ReviewerAvatar from "@/components/base/ReviewerAvatar";
import { getReviews } from "@/services/reviews.service";
import { getCompanies } from "@/services/companies.service";
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
  verified: boolean;
}

function ReviewCard({ review }: { review: SampleReview }) {
  return (
    <div
      data-review-card
      className="flex-shrink-0 w-[85%] sm:w-[360px] lg:w-[calc((100%-2rem)/3)] p-5 bg-background-50 border border-background-200/60 rounded-2xl shadow-[0_1px_6px_rgba(7,27,58,0.03)] hover:shadow-[0_4px_16px_rgba(7,27,58,0.06)] hover:border-background-300/50 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <ReviewerAvatar name={review.name} />
          <div>
            <p className="text-sm font-semibold text-foreground-900 leading-tight">
              {review.name}
            </p>
            <p className="text-xs text-foreground-400">{review.type}</p>
          </div>
        </div>
        {review.verified && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap text-primary-600 bg-primary-50">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            Verified
          </span>
        )}
      </div>

      {/* Stars */}
      <div className="mb-2">
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-foreground-800 mb-1.5 line-clamp-1">
        {review.title}
      </p>

      {/* Text */}
      <p className="text-sm text-foreground-500 leading-relaxed line-clamp-3 mb-3">
        {review.text}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-background-200/50">
        <span className="text-xs text-foreground-400 truncate max-w-[140px]">
          {review.provider}
        </span>
        <span className="text-xs text-foreground-400">{review.date}</span>
      </div>
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
            const company = companyBySlug.get(r.provider_id);
            return {
              id: r.review_id,
              name: r.reviewer_name?.trim() || "Anonymous",
              type: r.reviewer_type === "learner" ? "Apprentice" : "Employer",
              rating: r.rating,
              title: r.review_title,
              text: r.review_text,
              provider: company?.trading_name ?? "Training provider",
              date: formatRelativeTime(r.review_date),
              verified: r.verification_status === "Verified",
            };
          })
        );
      })
      .catch(() => setReviews([]))
      .finally(() => onReady?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Smooth continuous marquee scroll — arrow clicks ease toward a target,
  // then the automatic drift picks back up on its own, pausing only on hover.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || reviews.length === 0) return;

    // Duplicate the content once for a seamless loop; half the track width is one full set
    halfWidthRef.current = track.scrollWidth / 2;

    let lastTime = 0;
    const speed = 40; // pixels per second

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
    const target = ((base + direction * step) % half + half) % half;
    manualTargetRef.current = target;
  };

  if (reviews.length === 0) return null;

  return (
    <section className="relative w-full bg-background-50 overflow-hidden">
      <div className="w-full px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 gap-4">
            <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground-900">
              Recent reviews
            </h2>

            <div className="flex items-center gap-3">
              {/* Prev / Next arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scroll(-1)}
                  aria-label="Previous reviews"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-background-200/70 text-foreground-600 hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-600 transition-all duration-200 whitespace-nowrap"
                >
                  <i className="ri-arrow-left-line text-base" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll(1)}
                  aria-label="Next reviews"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-background-200/70 text-foreground-600 hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-600 transition-all duration-200 whitespace-nowrap"
                >
                  <i className="ri-arrow-right-line text-base" />
                </button>
              </div>

              <Link
                to="/reviews"
                className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors whitespace-nowrap"
              >
                View all reviews
              </Link>
            </div>
          </div>

          {/* Carousel — smooth continuous marquee, pausing on hover */}
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

            {/* Left / Right fade overlays */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-10 md:w-20 lg:w-28 z-10"
              style={{
                background:
                  "linear-gradient(to right, oklch(var(--background-50)), oklch(var(--background-50) / 0))",
              }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-10 md:w-20 lg:w-28 z-10"
              style={{
                background:
                  "linear-gradient(to left, oklch(var(--background-50)), oklch(var(--background-50) / 0))",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
