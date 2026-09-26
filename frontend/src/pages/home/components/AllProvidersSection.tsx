import { Link } from "react-router-dom";
import StarRating from "@/components/base/StarRating";
import { useComparison } from "@/contexts/ComparisonContext";

interface MiniProvider {
  id: string;
  name: string;
  initials: string;
  programme: string;
  rating: number;
  reviews: number;
  logoUrl?: string;
  website?: string;
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
  const { choices, toggle } = useComparison();
  const selected = choices.some((item) => item.id === provider.id);
  const full = choices.length >= 3 && !selected;
  const hasReviews = provider.reviews > 0;

  return (
    <article
      className={`provider-card group relative flex flex-col overflow-hidden rounded-2xl border bg-white/70 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 dark:bg-white/10 dark:shadow-[0_12px_32px_rgba(0,0,0,0.22)] md:p-6 ${
        selected ? "border-primary-500 ring-1 ring-primary-500 dark:border-primary-400 dark:ring-primary-400" : "border-white/60 dark:border-white/10"
      }`}
      style={{
        "--brand": provider.brandColor,
        animationDelay: `${idx * 80}ms`,
        animation: "providerFadeIn 0.5s ease-out both",
      } as React.CSSProperties}
    >
      <div className="card-top-line absolute left-4 right-4 top-[1px] h-0.5 rounded-full transition-all duration-300" />

      <div className="relative mb-4 flex items-center justify-center">
        <button
          type="button"
          onClick={() => {
            if (provider.website) window.open(provider.website, "_blank", "noopener,noreferrer");
          }}
          title={provider.website ? `Visit ${provider.name}'s website` : undefined}
          className="relative z-10 flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-visible transition-all duration-300 ease-out group-hover:scale-105"
        >
          {provider.logoUrl ? (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white p-2 shadow-[0_1px_6px_rgba(0,0,0,0.08)]">
              <img src={provider.logoUrl} alt={`${provider.name} logo`} className="h-full w-full object-contain" />
            </div>
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-extrabold tracking-tight text-white"
              style={{ backgroundColor: provider.brandColor || "#071B3A" }}
            >
              {provider.initials}
            </div>
          )}
        </button>
      </div>

      <div className="mb-3 flex justify-center">
        {hasReviews ? (
          <div className="brand-rating-bg flex items-center gap-1 rounded-full bg-background-100 px-2.5 py-1 transition-colors duration-300">
            <StarRating rating={provider.rating} size="sm" />
            <span className="brand-rating-text text-xs font-bold text-foreground-700 transition-colors duration-300">
              {provider.rating.toFixed(1)} out of 5
            </span>
          </div>
        ) : (
          <span className="rounded-full bg-background-100 px-3 py-1 text-xs font-semibold text-foreground-600">
            Not yet reviewed
          </span>
        )}
      </div>

      <h3 className="brand-text mb-1 text-center font-heading text-base font-bold leading-snug text-foreground-900 transition-colors duration-300">
        <Link to={`/provider/${provider.id}`} className="hover:text-primary-600">
          {provider.name}
        </Link>
      </h3>

      <p className="mb-3 text-center text-xs text-foreground-500">{provider.programme}</p>

      <div className="brand-divider mb-3 h-px w-full bg-background-200/60 transition-colors duration-300" />

      <div className="mt-auto space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="brand-icon-bg flex h-7 w-7 items-center justify-center rounded-lg bg-background-100 text-foreground-500 transition-colors duration-300">
            <i className="ri-chat-3-line text-xs" />
          </div>
          <span className="font-semibold text-foreground-800">
            {hasReviews ? `${provider.reviews.toLocaleString()} ${provider.reviews === 1 ? "review" : "reviews"}` : "No apprenticeship reviews yet"}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-background-200/60 pt-4">
          <Link to={`/provider/${provider.id}`} className="btn btn-sm btn-primary">
            View provider
          </Link>
          <button
            type="button"
            aria-pressed={selected}
            disabled={full}
            onClick={() => toggle({ id: provider.id, name: provider.name })}
            className="btn btn-sm btn-outline"
          >
            {selected ? "Selected" : full ? "3 selected" : "Add to comparison"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function AllProvidersSection({ title, subtitle, tracks, viewAllHref }: AllProvidersSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-background-50">
      <div className="w-full px-4 py-12 md:px-6 md:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground-900 md:text-3xl">{title}</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground-500 md:text-base">{subtitle}</p>
            </div>
            <Link
              to={viewAllHref}
              className="btn btn-md btn-outline self-start sm:self-auto"
            >
              Browse providers
              <i className="ri-arrow-right-line text-sm" />
            </Link>
          </div>

          <div className="space-y-10 md:space-y-12">
            {tracks.map((track, tIdx) => (
              <div key={track.label}>
                <div className="mb-5 flex items-center gap-3 md:mb-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                    <i className={`${track.icon} text-base`} />
                  </div>
                  <h3 className="font-heading text-lg font-bold tracking-tight text-foreground-800 md:text-xl">{track.label}</h3>
                  <div className="hidden h-px flex-1 bg-background-200/60 sm:block" />
                  <span className="rounded-full bg-background-100 px-3 py-1 text-sm text-foreground-500">
                    {track.providers.length} shown
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
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
        @keyframes providerFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .provider-card:hover {
          box-shadow: 0 16px 48px color-mix(in srgb, var(--brand) 10%, transparent);
        }
        .provider-card:hover .card-top-line {
          background: linear-gradient(to right, color-mix(in srgb, var(--brand) 0%, transparent), color-mix(in srgb, var(--brand) 55%, transparent), color-mix(in srgb, var(--brand) 0%, transparent));
        }
        .provider-card:hover .brand-rating-bg,
        .provider-card:hover .brand-icon-bg {
          background: color-mix(in srgb, var(--brand) 10%, transparent);
        }
        .provider-card:hover .brand-rating-text,
        .provider-card:hover .brand-text,
        .provider-card:hover .brand-icon-bg {
          color: var(--brand);
        }
        .provider-card:hover .brand-divider {
          background: color-mix(in srgb, var(--brand) 28%, transparent);
        }
      `}</style>
    </section>
  );
}
