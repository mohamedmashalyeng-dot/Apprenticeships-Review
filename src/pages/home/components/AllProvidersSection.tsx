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

interface TrackGroup {
  label: string;
  icon: string;
  providers: MiniProvider[];
}

interface AllProvidersSectionProps {
  title: string;
  subtitle: string;
  tracks: TrackGroup[];
  viewAllHref: string;
}

function ProviderCard({ provider, idx }: { provider: MiniProvider; idx: number }) {
  return (
    <Link
      key={provider.id}
      to={`/provider/${provider.id}`}
      className="provider-card group relative flex flex-col p-5 md:p-6 bg-background-50 border border-background-200/70 rounded-2xl hover:-translate-y-1.5 transition-all duration-400 ease-out overflow-hidden"
      style={{
        "--brand": provider.brandColor,
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

      {/* Brand identity — logo */}
      <div className="relative flex items-center justify-center mb-4">
        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center overflow-visible group-hover:scale-110 transition-all duration-400 ease-out z-10">
          {provider.logoUrl ? (
            <div className="w-20 h-20 flex items-center justify-center rounded-xl bg-white p-2" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
              <img
                src={provider.logoUrl}
                alt={`${provider.name} logo`}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div
              className="w-16 h-16 flex items-center justify-center rounded-2xl text-lg font-extrabold tracking-tight text-white"
              style={{ backgroundColor: provider.brandColor || "#071B3A" }}
            >
              {provider.initials}
            </div>
          )}
        </div>
      </div>

      {/* Rating pill */}
      <div className="flex items-center justify-center mb-3">
        <div className="brand-rating-bg flex items-center gap-1 px-2.5 py-1 bg-background-100 rounded-full transition-colors duration-300">
          <StarRating rating={provider.rating} size="sm" />
          <span className="brand-rating-text text-xs font-bold text-foreground-600 transition-colors duration-300">
            {provider.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Provider name */}
      <h3 className="brand-text font-heading text-base font-bold text-foreground-900 leading-snug transition-colors duration-300 line-clamp-2 mb-1 text-center">
        {provider.name}
      </h3>

      {/* Programme type */}
      <p className="text-xs text-foreground-400 mb-3 text-center">
        {provider.programme}
      </p>

      {/* Divider */}
      <div className="brand-divider w-full h-px bg-background-200/60 transition-colors duration-300 mb-3" />

      {/* Reviews stat */}
      <div className="flex items-center gap-2 mt-auto">
        <div className="brand-icon-bg w-7 h-7 flex items-center justify-center rounded-lg bg-background-100 text-foreground-500 transition-colors duration-300">
          <i className="ri-chat-3-line text-xs" />
        </div>
        <span className="text-sm font-semibold text-foreground-700">
          {provider.reviews.toLocaleString()}
        </span>
        <span className="text-sm text-foreground-400">reviews</span>

        <div className="brand-arrow ml-auto w-7 h-7 flex items-center justify-center rounded-full text-foreground-300 group-hover:translate-x-1 transition-all duration-300 opacity-0 group-hover:opacity-100">
          <i className="ri-arrow-right-line text-sm" />
        </div>
      </div>
    </Link>
  );
}

export default function AllProvidersSection({
  title,
  subtitle,
  tracks,
  viewAllHref,
}: AllProvidersSectionProps) {
  return (
    <section className="relative w-full bg-gradient-to-b from-background-50 via-background-50 to-background-50 overflow-hidden">
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
            <Link
              to={viewAllHref}
              className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 bg-background-50 border border-background-200/70 text-sm font-semibold text-primary-500 rounded-full hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-600 transition-all duration-200 whitespace-nowrap"
            >
              View all providers
              <i className="ri-arrow-right-line text-sm" />
            </Link>
          </div>

          {/* Track groups */}
          <div className="space-y-10 md:space-y-12">
            {tracks.map((track, tIdx) => (
              <div key={track.label}>
                {/* Track label */}
                <div className="flex items-center gap-3 mb-5 md:mb-6">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                    <i className={`${track.icon} text-base`} />
                  </div>
                  <h3 className="font-heading text-lg md:text-xl font-bold text-foreground-800 tracking-tight">
                    {track.label}
                  </h3>
                  <div className="hidden sm:block flex-1 h-px bg-background-200/60" />
                  <span className="text-sm text-foreground-400 bg-background-100 px-3 py-1 rounded-full">
                    {track.providers.length} providers
                  </span>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {track.providers.map((p, idx) => (
                    <ProviderCard key={p.id} provider={p} idx={tIdx * 10 + idx} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
          animation-play-state: paused;
        }

        .group:hover .category-border-beam::before {
          animation-play-state: running;
        }

        @keyframes beam-rotate {
          to {
            --beam-angle: 360deg;
          }
        }

        @keyframes providerFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .provider-card:hover {
          box-shadow: 0 16px 48px color-mix(in srgb, var(--brand) 10%, transparent);
        }
        .provider-card:hover .card-top-line {
          background: linear-gradient(to right, color-mix(in srgb, var(--brand) 0%, transparent), color-mix(in srgb, var(--brand) 55%, transparent), color-mix(in srgb, var(--brand) 0%, transparent));
        }
        .provider-card:hover .brand-rating-bg {
          background: color-mix(in srgb, var(--brand) 10%, transparent);
        }
        .provider-card:hover .brand-rating-text {
          color: var(--brand);
        }
        .provider-card:hover .brand-text {
          color: var(--brand);
        }
        .provider-card:hover .brand-divider {
          background: color-mix(in srgb, var(--brand) 28%, transparent);
        }
        .provider-card:hover .brand-icon-bg {
          background: color-mix(in srgb, var(--brand) 12%, transparent);
          color: var(--brand);
        }
        .provider-card:hover .brand-arrow {
          background: color-mix(in srgb, var(--brand) 10%, transparent);
          color: var(--brand);
        }
      `}</style>
    </section>
  );
}