import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "@/components/base/StarRating";

interface DemoReview {
  id: string;
  name: string;
  type: string;
  rating: number;
  title: string;
  text: string;
  provider: string;
  date: string;
  daysAgo: string;
  avatar: string;
}

const demoReviews: DemoReview[] = [
  {
    id: "demo-1",
    name: "Sophie C.",
    type: "Apprentice",
    rating: 5,
    title: "Great support from tutors",
    text: "I received excellent support throughout my apprenticeship. The tutors were knowledgeable and always available to help with any questions I had.",
    provider: "Kent Business College",
    date: "2 days ago",
    daysAgo: "2 days ago",
    avatar:
      "https://readdy.ai/api/search-image?query=Portrait%20headshot%20of%20a%20young%20professional%20woman%20in%20her%20early%20twenties%20with%20a%20warm%20friendly%20smile%2C%20soft%20natural%20lighting%2C%20clean%20neutral%20beige%20studio%20background%2C%20casual%20smart%20attire%2C%20editorial%20headshot%20photography%2C%20high%20detail%2C%20realistic%20and%20approachable%20professional%20atmosphere&width=200&height=200&seq=review-avatar-sophie-01&orientation=squarish",
  },
  {
    id: "demo-2",
    name: "Jake D.",
    type: "Employer",
    rating: 4,
    title: "Professional and responsive",
    text: "The team was professional and responsive throughout the entire programme. They delivered excellent results for our marketing apprentice.",
    provider: "Oxford Professional Education Group",
    date: "4 days ago",
    daysAgo: "4 days ago",
    avatar:
      "https://readdy.ai/api/search-image?query=Portrait%20headshot%20of%20a%20confident%20professional%20man%20in%20his%20thirties%20with%20a%20subtle%20smile%2C%20soft%20natural%20window%20lighting%2C%20clean%20neutral%20beige%20studio%20background%2C%20business%20casual%20blazer%2C%20editorial%20headshot%20photography%2C%20high%20detail%2C%20realistic%20and%20trustworthy%20professional%20atmosphere&width=200&height=200&seq=review-avatar-jake-01&orientation=squarish",
  },
  {
    id: "demo-3",
    name: "Liam H.",
    type: "Apprentice",
    rating: 4,
    title: "Helpful programme structure",
    text: "The content was up to date and the support throughout was second to none. The programme structure really helped me stay on track.",
    provider: "The JGA Group",
    date: "1 week ago",
    daysAgo: "1 week ago",
    avatar:
      "https://readdy.ai/api/search-image?query=Portrait%20headshot%20of%20a%20young%20friendly%20man%20in%20his%20early%20twenties%20with%20a%20genuine%20smile%2C%20soft%20natural%20lighting%2C%20clean%20neutral%20beige%20studio%20background%2C%20casual%20smart%20shirt%2C%20editorial%20headshot%20photography%2C%20high%20detail%2C%20realistic%20and%20approachable%20professional%20atmosphere&width=200&height=200&seq=review-avatar-liam-01&orientation=squarish",
  },
  {
    id: "demo-4",
    name: "Emma T.",
    type: "Employer",
    rating: 5,
    title: "Reliable training partner",
    text: "Reliable training partner with clear communication and strong learner outcomes. We have continued to work with them for multiple cohorts.",
    provider: "RDS Training",
    date: "1 week ago",
    daysAgo: "1 week ago",
    avatar:
      "https://readdy.ai/api/search-image?query=Portrait%20headshot%20of%20a%20professional%20woman%20in%20her%20late%20thirties%20with%20a%20confident%20warm%20expression%2C%20soft%20natural%20lighting%2C%20clean%20neutral%20beige%20studio%20background%2C%20smart%20business%20attire%2C%20editorial%20headshot%20photography%2C%20high%20detail%2C%20realistic%20and%20trustworthy%20professional%20atmosphere&width=200&height=200&seq=review-avatar-emma-01&orientation=squarish",
  },
  {
    id: "demo-5",
    name: "Natalie R.",
    type: "Apprentice",
    rating: 5,
    title: "My degree apprenticeship has opened so many doors",
    text: "My degree apprenticeship has opened so many doors. Amazing experience so far and I would highly recommend it to anyone considering this path.",
    provider: "Cambridge Marketing College",
    date: "2 weeks ago",
    daysAgo: "2 weeks ago",
    avatar:
      "https://readdy.ai/api/search-image?query=Portrait%20headshot%20of%20a%20young%20cheerful%20woman%20in%20her%20mid%20twenties%20with%20a%20bright%20genuine%20smile%2C%20soft%20natural%20lighting%2C%20clean%20neutral%20beige%20studio%20background%2C%20smart%20casual%20attire%2C%20editorial%20headshot%20photography%2C%20high%20detail%2C%20realistic%20and%20approachable%20professional%20atmosphere&width=200&height=200&seq=review-avatar-natalie-01&orientation=squarish",
  },
];

function ReviewCard({ review }: { review: DemoReview }) {
  return (
    <div
      data-review-card
      className="snap-start flex-shrink-0 w-[85%] sm:w-[360px] lg:w-[calc((100%-2rem)/3)] p-5 bg-background-50 border border-background-200/60 rounded-2xl shadow-[0_1px_6px_rgba(7,27,58,0.03)] hover:shadow-[0_4px_16px_rgba(7,27,58,0.06)] hover:border-background-300/50 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 flex-shrink-0 rounded-full overflow-hidden border border-background-200">
            <img
              src={review.avatar}
              alt={`${review.name} avatar`}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground-900 leading-tight">
              {review.name}
            </p>
            <p className="text-xs text-foreground-400">{review.type}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-full whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
          Verified
        </span>
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
        <span className="text-xs text-foreground-400">{review.daysAgo}</span>
      </div>
    </div>
  );
}

export default function RecentReviewsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const positionRef = useRef(0);
  const halfWidthRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Smooth continuous marquee scroll, pausing on hover
  useEffect(() => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    // Duplicate the content once for a seamless loop; half the track width is one full set
    halfWidthRef.current = track.scrollWidth / 2;

    let lastTime = 0;
    const speed = 40; // pixels per second

    const step = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (!isPaused) {
        positionRef.current += speed * delta;
        const half = halfWidthRef.current;
        if (half > 0 && positionRef.current >= half) {
          positionRef.current -= half;
        }
      }

      track.style.transform = `translate3d(${-positionRef.current}px, 0, 0)`;
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused]);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  const scroll = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    const step = card ? card.offsetWidth + 16 : 360;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

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
                  disabled={!canPrev}
                  aria-label="Previous reviews"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-background-200/70 text-foreground-600 hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-600 disabled:opacity-35 disabled:pointer-events-none transition-all duration-200 whitespace-nowrap"
                >
                  <i className="ri-arrow-left-line text-base" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll(1)}
                  disabled={!canNext}
                  aria-label="Next reviews"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-background-200/70 text-foreground-600 hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-600 disabled:opacity-35 disabled:pointer-events-none transition-all duration-200 whitespace-nowrap"
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

          {/* Demo label */}
          <div className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-100/50 rounded-lg">
            <i className="ri-information-line text-primary-400 text-sm" />
            <span className="text-xs font-medium text-primary-600">
              Sample reviews for demonstration
            </span>
          </div>

          {/* Carousel — smooth continuous marquee, pausing on hover */}
          <div className="relative">
            <div
              ref={scrollRef}
              onScroll={updateArrows}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="overflow-x-auto snap-x snap-mandatory scroll-smooth review-scroll"
            >
              <div ref={trackRef} className="flex gap-4 will-change-transform">
                {[...demoReviews, ...demoReviews].map((review, index) => (
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

      <style>{`
        .review-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .review-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}