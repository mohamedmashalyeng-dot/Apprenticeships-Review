import { Link } from "react-router-dom";
import StarRating from "@/components/base/StarRating";

interface MiniProvider {
  id: string;
  name: string;
  initials: string;
  programme: string;
  rating: number;
  reviews: number;
  logoUrl?: string;
  brandColor: string;
}

interface CompetitorCard {
  id: string;
  name: string;
  initials: string;
  logoUrl?: string;
  publicStrength: string;
  strategicGap: string;
  kbcResponse: string;
  brandColor: string;
}

interface BestProvidersRowProps {
  title: string;
  subtitle: string;
  providers: MiniProvider[];
  viewAllHref: string;
  competitors?: CompetitorCard[];
}

export default function BestProvidersRow({
  title,
  subtitle,
  providers,
  viewAllHref,
  competitors,
}: BestProvidersRowProps) {
  const isCompetitorMode = !!competitors && competitors.length > 0;
  const cards = isCompetitorMode ? competitors! : providers;

  return (
    <section className="w-full bg-gradient-to-b from-background-50 via-background-50 to-background-50">
      <div className="w-full px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 md:mb-10 gap-4">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-900 tracking-tight">
                {title}
              </h2>
              <p className="mt-2 text-sm md:text-base text-foreground-500 max-w-md leading-relaxed">
                {subtitle}
              </p>
            </div>
            {!isCompetitorMode && (
              <Link
                to={viewAllHref}
                className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 bg-background-50 border border-background-200/70 text-sm font-semibold text-primary-500 rounded-full hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-600 transition-all duration-200 whitespace-nowrap"
              >
                View all providers
                <i className="ri-arrow-right-line text-sm" />
              </Link>
            )}
          </div>

          {/* Cards grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 ${
            isCompetitorMode ? "lg:grid-cols-3" : "lg:grid-cols-4"
          }`}>
            {isCompetitorMode
              ? (cards as CompetitorCard[]).map((c, idx) => (
                  <div
                    key={c.id}
                    className="competitor-card group relative flex flex-col p-5 md:p-6 bg-background-50 border border-background-200/70 rounded-2xl hover:-translate-y-1.5 transition-all duration-400 ease-out cursor-default overflow-hidden"
                    style={{
                      "--brand": c.brandColor,
                      animationDelay: `${idx * 80}ms`,
                      animation: "providerFadeIn 0.5s ease-out both",
                    } as React.CSSProperties}
                  >
                    {/* Hover border beam */}
                    <span
                      aria-hidden="true"
                      className="category-border-beam pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />

                    {/* Top gradient line on hover */}
                    <div className="card-top-line absolute top-[1px] left-4 right-4 h-0.5 rounded-full transition-all duration-400" />

                    {/* Brand glow area */}
                    <div className="relative flex items-center justify-center mb-4">
                      <div className="brand-glow-bg absolute w-24 h-24 rounded-full scale-75 group-hover:scale-100 transition-all duration-400 ease-out" />
                      <div className="brand-glow-ring absolute w-28 h-28 rounded-full border-2 scale-50 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out" />

                      {/* Logo or initials */}
                      <div className="relative w-20 h-12 flex items-center justify-center group-hover:scale-105 transition-all duration-400 ease-out z-10">
                        {c.logoUrl ? (
                          <img
                            src={c.logoUrl}
                            alt={`${c.name} logo`}
                            className="max-w-full max-h-full object-contain rounded-lg bg-white"
                            style={{ maxWidth: "80px", maxHeight: "48px", padding: "2px" }}
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="w-14 h-14 flex items-center justify-center rounded-full text-white text-lg font-extrabold tracking-tight"
                          style={{ backgroundColor: c.brandColor, display: c.logoUrl ? "none" : "flex" }}
                        >
                          {c.initials}
                        </div>
                      </div>
                    </div>

                    {/* Competitor name */}
                    <h3 className="brand-text font-heading text-base font-bold text-foreground-900 leading-snug transition-colors duration-300 mb-1 text-center">
                      {c.name}
                    </h3>

                    {/* Public Strength — visible always */}
                    <p className="text-xs text-foreground-500 leading-relaxed mb-4 text-center line-clamp-3">
                      {c.publicStrength}
                    </p>

                    {/* Divider */}
                    <div className="brand-divider w-full h-px bg-background-200/60 transition-colors duration-300 mb-3" />

                    {/* Strategic Gap — revealed on hover */}
                    <div className="mt-auto space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="brand-icon-bg w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-lg bg-secondary-100 text-secondary-600 transition-colors duration-300 mt-0.5">
                          <i className="ri-error-warning-line text-xs" />
                        </div>
                        <p className="text-xs text-foreground-500 leading-relaxed transition-colors duration-300 line-clamp-3">
                          {c.strategicGap}
                        </p>
                      </div>

                      {/* KBC Response */}
                      <div className="flex items-start gap-2 pt-2 border-t border-background-100 transition-colors duration-300"
                        style={{ borderColor: "transparent" }}
                      >
                        <div className="brand-arrow w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary-100 text-primary-600 transition-colors duration-300 mt-0.5">
                          <i className="ri-shield-check-line text-xs" />
                        </div>
                        <p className="brand-text text-xs text-foreground-600 leading-relaxed font-medium transition-colors duration-300 line-clamp-3">
                          {c.kbcResponse}
                        </p>
                      </div>
                    </div>

                    {/* Arrow on hover */}
                    <div className="brand-arrow absolute bottom-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-foreground-300 group-hover:translate-x-1 transition-all duration-300 opacity-0 group-hover:opacity-100">
                      <i className="ri-arrow-right-up-line text-sm" />
                    </div>
                  </div>
                ))
              : (cards as MiniProvider[]).map((p, idx) => (
                  <Link
                    key={p.id}
                    to={`/provider/${p.id}`}
                    className="provider-card group relative flex flex-col p-5 md:p-6 bg-background-50 border border-background-200/70 rounded-2xl hover:-translate-y-1.5 transition-all duration-400 ease-out overflow-hidden"
                    style={{
                      "--brand": p.brandColor,
                      animationDelay: `${idx * 80}ms`,
                      animation: "providerFadeIn 0.5s ease-out both",
                    } as React.CSSProperties}
                  >
                    {/* Hover border beam */}
                    <span
                      aria-hidden="true"
                      className="category-border-beam pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />

                    {/* Top gradient line on hover */}
                    <div className="card-top-line absolute top-[1px] left-4 right-4 h-0.5 rounded-full transition-all duration-400" />

                    {/* Brand identity reveal area — logo with glow background on hover */}
                    <div className="relative flex items-center justify-center mb-4">
                      {/* Glow circle behind logo — only visible on hover */}
                      <div className="brand-glow-bg absolute w-24 h-24 rounded-full scale-75 group-hover:scale-100 transition-all duration-400 ease-out" />
                      
                      {/* Outer glow ring */}
                      <div className="brand-glow-ring absolute w-28 h-28 rounded-full border-2 scale-50 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out" />

                      {/* Logo — no box, larger on hover */}
                      <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center overflow-visible group-hover:scale-110 transition-all duration-400 ease-out z-10">
                        {p.logoUrl ? (
                          <img
                            src={p.logoUrl}
                            alt={`${p.name} logo`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center rounded-2xl text-lg font-extrabold tracking-tight"
                            style={{ backgroundColor: "#071B3A", color: "#FFFFFF" }}
                          >
                            {p.initials}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating pill */}
                    <div className="flex items-center justify-center mb-3">
                      <div className="brand-rating-bg flex items-center gap-1 px-2.5 py-1 bg-background-100 rounded-full transition-colors duration-300">
                        <StarRating rating={p.rating} size="sm" />
                        <span className="brand-rating-text text-xs font-bold text-foreground-600 transition-colors duration-300">
                          {p.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Provider name */}
                    <h3 className="brand-text font-heading text-base font-bold text-foreground-900 leading-snug transition-colors duration-300 line-clamp-2 mb-1 text-center">
                      {p.name}
                    </h3>

                    {/* Programme type */}
                    <p className="text-xs text-foreground-400 mb-3 text-center">
                      {p.programme}
                    </p>

                    {/* Divider */}
                    <div className="brand-divider w-full h-px bg-background-200/60 transition-colors duration-300 mb-3" />

                    {/* Reviews stat */}
                    <div className="flex items-center gap-2 mt-auto">
                      <div className="brand-icon-bg w-7 h-7 flex items-center justify-center rounded-lg bg-background-100 text-foreground-500 transition-colors duration-300">
                        <i className="ri-chat-3-line text-xs" />
                      </div>
                      <span className="text-sm font-semibold text-foreground-700">
                        {p.reviews.toLocaleString()}
                      </span>
                      <span className="text-sm text-foreground-400">
                        reviews
                      </span>

                      {/* Arrow appears on hover */}
                      <div className="brand-arrow ml-auto w-7 h-7 flex items-center justify-center rounded-full text-foreground-300 group-hover:translate-x-1 transition-all duration-300 opacity-0 group-hover:opacity-100">
                        <i className="ri-arrow-right-line text-sm" />
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </div>

      {/* Keyframe for staggered entrance + brand hover rules */}
      <style>{`
        @property --beam-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        .category-border-beam {
          --border-width: 1.5px;
          padding: var(--border-width);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
        }

        .category-border-beam::before {
          content: "";
          position: absolute;
          inset: -100%;
          background: conic-gradient(
            from var(--beam-angle),
            transparent 0deg,
            var(--brand) 60deg,
            transparent 120deg
          );
          animation: beam-rotate 2.5s linear infinite;
        }

        @keyframes beam-rotate {
          to {
            --beam-angle: 360deg;
          }
        }

        @keyframes providerFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Brand color hover rules — each card has its own --brand CSS variable */
        .provider-card:hover,
        .competitor-card:hover {
          box-shadow: 0 16px 48px color-mix(in srgb, var(--brand) 10%, transparent);
        }
        .provider-card:hover .card-top-line,
        .competitor-card:hover .card-top-line {
          background: linear-gradient(to right, color-mix(in srgb, var(--brand) 0%, transparent), color-mix(in srgb, var(--brand) 55%, transparent), color-mix(in srgb, var(--brand) 0%, transparent));
        }
        .provider-card:hover .brand-glow-bg,
        .competitor-card:hover .brand-glow-bg {
          background: color-mix(in srgb, var(--brand) 13%, transparent);
        }
        .provider-card:hover .brand-glow-ring,
        .competitor-card:hover .brand-glow-ring {
          border-color: color-mix(in srgb, var(--brand) 35%, transparent);
        }
        .provider-card:hover .brand-rating-bg,
        .competitor-card:hover .brand-rating-bg {
          background: color-mix(in srgb, var(--brand) 10%, transparent);
        }
        .provider-card:hover .brand-rating-text,
        .competitor-card:hover .brand-rating-text {
          color: var(--brand);
        }
        .provider-card:hover .brand-text,
        .competitor-card:hover .brand-text {
          color: var(--brand);
        }
        .provider-card:hover .brand-divider,
        .competitor-card:hover .brand-divider {
          background: color-mix(in srgb, var(--brand) 28%, transparent);
        }
        .provider-card:hover .brand-icon-bg,
        .competitor-card:hover .brand-icon-bg {
          background: color-mix(in srgb, var(--brand) 12%, transparent);
          color: var(--brand);
        }
        .provider-card:hover .brand-arrow,
        .competitor-card:hover .brand-arrow {
          background: color-mix(in srgb, var(--brand) 10%, transparent);
          color: var(--brand);
        }
      `}</style>
    </section>
  );
}