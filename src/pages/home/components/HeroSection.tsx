import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { providers } from "@/mocks/providers";
import { learnerReviews, employerReviews } from "@/mocks/reviews";
import StarRating from "@/components/base/StarRating";

function getProviderStats(providerId: string) {
  const all = [...learnerReviews, ...employerReviews].filter(
    (r) => r.provider_id === providerId
  );
  if (all.length === 0) return { rating: 0, count: 0 };
  const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
  return { rating: avg, count: all.length };
}

const categoryPills = [
  { label: "Marketing", href: "/categories" },
  { label: "Project Management", href: "/categories" },
  { label: "Digital Marketing", href: "/categories" },
  { label: "Business Admin", href: "/categories" },
  { label: "Degree Apprenticeships", href: "/categories" },
  { label: "Project Controls", href: "/categories" },
];

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return providers.filter(
      (p) =>
        p.trading_name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const totalReviews = learnerReviews.length + employerReviews.length;
  const avgPlatformRating =
    [...learnerReviews, ...employerReviews].reduce((s, r) => s + r.rating, 0) /
    totalReviews;

  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://readdy.ai/api/search-image?query=A%20wide%20cinematic%20view%20of%20a%20diverse%20team%20of%20professionals%20collaborating%20in%20a%20bright%20modern%20open%20office%2C%20gathered%20around%20a%20large%20table%20with%20laptops%20and%20documents%2C%20warm%20golden%20sunlight%20streaming%20through%20floor%20to%20ceiling%20windows%2C%20soft%20beige%20and%20amber%20tones%20with%20subtle%20teal%20accents%2C%20editorial%20photography%2C%20shallow%20depth%20of%20field%2C%20high%20detail%2C%20realistic%20inspiring%20professional%20atmosphere&width=1800&height=1000&seq=home-hero-banner&orientation=landscape&nocache=true"
          alt="Abstract background representing apprenticeship community"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 pt-20 pb-14 md:pt-28 md:pb-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-background-50/15 backdrop-blur-sm border border-background-50/20 rounded-full mb-7">
            <StarRating rating={avgPlatformRating} size="sm" />
            <span className="text-sm font-semibold text-white">
              {avgPlatformRating.toFixed(1)} out of 5
            </span>
            <span className="w-px h-3.5 bg-background-50/30" />
            <span className="text-sm text-white/85">
              {totalReviews} verified reviews
            </span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.08] tracking-tight">
            Find an apprenticeship{" "}
            <span className="text-primary-400">provider you can trust</span>
          </h1>

          <p className="mt-5 text-base md:text-lg text-white/90 max-w-xl mx-auto leading-relaxed">
            Compare UK apprenticeship training providers using verified reviews, public data, and transparent scoring.
          </p>

          {/* Search bar - more premium */}
          <div className="mt-9 max-w-2xl mx-auto">
            <div className="relative flex items-center bg-background-50/95 rounded-full border border-background-50/30 shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_24px_rgba(11,92,255,0.12)] hover:border-primary-200/50 transition-all duration-300 overflow-hidden">
              <div className="absolute left-5 text-foreground-400">
                <i className="ri-search-line text-lg" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search apprenticeship standard, provider or keyword"
                className="w-full pl-14 pr-20 py-4 md:py-[18px] text-base text-foreground-900 bg-transparent placeholder:text-foreground-400 outline-none"
              />
              <Link
                to={`/providers${searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : ""}`}
                className="absolute right-2 w-10 h-10 md:w-11 md:h-11 flex items-center justify-center bg-primary-500 text-white rounded-full hover:bg-primary-600 active:scale-95 transition-all duration-200"
              >
                <i className="ri-search-line text-base" />
              </Link>
            </div>

            {/* Search dropdown */}
            {filteredProviders.length > 0 && (
              <div className="relative">
                <div className="absolute top-3 left-0 right-0 bg-background-50 border border-background-200/70 rounded-2xl shadow-2xl overflow-hidden z-20">
                  {filteredProviders.slice(0, 5).map((p) => {
                    const stats = getProviderStats(p.provider_id);
                    return (
                      <Link
                        key={p.provider_id}
                        to={`/provider/${p.provider_id}`}
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-background-100 transition-colors border-b border-background-100 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground-900">
                            {p.trading_name}
                          </p>
                          <p className="text-xs text-foreground-500">
                            {p.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={stats.rating} size="sm" />
                          <span className="text-xs font-medium text-foreground-600">
                            {stats.rating.toFixed(1)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/add-review"
              className="w-full sm:w-auto px-7 py-3.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors whitespace-nowrap shadow-[0_2px_12px_rgba(11,92,255,0.22)]"
            >
              <i className="ri-pencil-line mr-1.5" />
              Write a Review
            </Link>
            <Link
              to="/methodology"
              className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-6 py-3.5 text-sm font-medium text-white rounded-full hover:text-white hover:bg-background-50/10 transition-colors whitespace-nowrap"
            >
              See how it works
              <i className="ri-arrow-right-line" />
            </Link>
          </div>

          {/* Trust line */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-white/85">
            <i className="ri-shield-check-line text-primary-400" />
            <span>Independent. Transparent. Built for learners and employers.</span>
          </div>

          {/* Category pills */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 md:gap-2.5">
            {categoryPills.map((pill) => (
              <Link
                key={pill.label}
                to={pill.href}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-background-50/15 backdrop-blur-sm border border-background-50/20 text-sm font-medium text-white rounded-full hover:border-primary-300 hover:text-white transition-all duration-200 whitespace-nowrap"
              >
                <i className="ri-arrow-right-s-fill text-primary-400 text-xs" />
                {pill.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}