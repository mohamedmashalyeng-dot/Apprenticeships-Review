import { useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "@/components/base/StarRating";
import { useComparison } from "@/contexts/ComparisonContext";
import { providerExternalLinks } from "@/data/providerExternalLinks";
import type { Provider } from "@/types/provider";

const providerLogoOverrides: Record<string, string> = {
  "lift-schools": "https://cdn.prod.website-files.com/668f964276953a8d446956f4/66d1b773f3c61b3747b91000_L1.png",
};

function getProviderMapUrl(provider: Provider): string | null {
  const sheetMapUrl = providerExternalLinks[provider.provider_id]?.map;
  if (sheetMapUrl) return sheetMapUrl;
  if (provider.locationUrl) return provider.locationUrl;
  if (!provider.location) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${provider.trading_name} ${provider.location}`,
  )}`;
}

function getProviderLogoUrl(provider: Provider): string | null {
  const logoOverride = providerLogoOverrides[provider.provider_id];
  if (logoOverride) return logoOverride;
  if (provider.logoUrl) return provider.logoUrl;

  const website = providerExternalLinks[provider.provider_id]?.website;
  if (!website) return null;

  try {
    const hostname = new URL(website).hostname.replace(/^www\./, "");
    return `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
  } catch {
    return null;
  }
}

export default function ProviderCard({ provider: p }: { provider: Provider }) {
  const { choices, toggle } = useComparison();
  const [failedLogo, setFailedLogo] = useState(false);
  const selected = choices.some((item) => item.id === p.provider_id);
  const full = choices.length >= 3 && !selected;
  const mapUrl = getProviderMapUrl(p);
  const logoUrl = getProviderLogoUrl(p);
  return <article className={`flex h-full flex-col rounded-2xl border bg-background-50 p-5 transition-shadow hover:shadow-lg ${selected ? "border-primary-500 ring-1 ring-primary-500" : "border-background-200"}`}>
    <div className="flex items-start gap-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-background-200 bg-primary-50 p-2">
        {logoUrl && !failedLogo ? <img src={logoUrl} alt="" width={56} height={56} loading="lazy" onError={() => setFailedLogo(true)} className="h-full w-full object-contain" /> : <span className="text-lg font-bold text-primary-700">{p.trading_name.split(" ").filter(Boolean).map((word) => word[0]).slice(0, 2).join("")}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold leading-snug text-foreground-900"><Link to={`/provider/${p.provider_id}`} className="hover:text-primary-600">{p.trading_name}</Link></h2>
        {p.location && <p className="mt-1 text-xs leading-relaxed text-foreground-500">{p.location}</p>}
      </div>
      {mapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${p.trading_name} location in Google Maps`}
          title="Open location in Google Maps"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-background-200 text-primary-600 transition-colors hover:border-primary-300 hover:bg-primary-50"
        >
          <i className="fa-solid fa-map-location-dot text-base" aria-hidden="true" />
        </a>
      )}
    </div>
    <div className="my-5 rounded-xl bg-background-100 p-3">
      {p.total_reviews > 0 ? <div className="flex flex-wrap items-center gap-2">
        <span className="text-lg font-bold text-foreground-900">{p.average_rating.toFixed(1)} out of 5</span>
        <StarRating rating={p.average_rating} size="sm" />
        <span className="text-xs text-foreground-600">Apprentice reviews on this website: {p.total_reviews.toLocaleString()} review{p.total_reviews !== 1 ? "s" : ""}</span>
      </div> : <p className="text-sm font-medium text-foreground-600">Not yet reviewed</p>}
    </div>
    <div className="mb-4 flex flex-wrap gap-2">{p.category_names.map((category) => <span key={category} className="rounded-lg bg-primary-50 px-2.5 py-1 text-xs text-primary-700">{category}</span>)}</div>
    {p.levels.length > 0 && <p className="mb-3 text-xs text-foreground-600">Apprenticeship levels: {[...p.levels].sort((a, b) => a - b).join(", ")}</p>}
    {p.recommendation_percent != null && <p className="mb-4 text-xs text-foreground-600"><span className="font-semibold text-foreground-900">{p.recommendation_percent}%</span> recommend among respondents</p>}
    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-background-200 pt-4">
      <Link to={`/provider/${p.provider_id}`} className="text-sm font-semibold text-primary-600 hover:underline">View provider</Link>
      <button type="button" aria-pressed={selected} aria-label={`${selected ? "Remove" : "Add"} ${p.trading_name} ${selected ? "from" : "to"} comparison`} disabled={full} onClick={() => toggle({ id: p.provider_id, name: p.trading_name })} className={`btn btn-sm ${selected ? "btn-soft" : "btn-outline"}`}>
        {selected ? "Selected" : full ? "3 selected - limit reached" : "Add to comparison"}
      </button>
    </div>
  </article>;
}
