import { Link } from "react-router-dom";
import VerifiedBadge from "@/components/base/VerifiedBadge";
import type { Provider, ProviderScore } from "@/types/provider";
import type { Review } from "@/types/review";

interface StandardProviderCardProps {
  provider: Provider;
  score: ProviderScore | null;
  reviews: { learner: Review[]; employer: Review[] };
}

export default function StandardProviderCard({ provider, score, reviews }: StandardProviderCardProps) {
  return (
    <div className="p-5 bg-background-50 rounded-2xl border border-background-200/70 hover:border-primary-200 transition-all duration-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <Link
            to={`/provider/${provider.provider_id}`}
            className="font-heading text-base font-semibold text-primary-600 hover:text-primary-700 truncate block"
          >
            {provider.trading_name}
          </Link>
          <p className="text-xs text-foreground-500 mt-0.5">{provider.legal_name}</p>
        </div>
        {provider.verification_status === "Verified" && (
          <div className="flex-shrink-0">
            <VerifiedBadge rounded="md" />
          </div>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground-500 mb-4">
        <span className="flex items-center gap-1">
          <i className="ri-government-line" />
          UKPRN: {provider.UKPRN}
        </span>
        <span className="flex items-center gap-1">
          <i className="ri-map-pin-line" />
          {provider.location}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2.5 bg-background-100 rounded-lg">
          <p className="text-xs text-foreground-500">Evidence Level</p>
          <p className="text-sm font-semibold text-foreground-800 mt-0.5">
            {score?.data_confidence_label ?? "Not Publicly Available"}
          </p>
        </div>
        <div className="p-2.5 bg-background-100 rounded-lg">
          <p className="text-xs text-foreground-500">Learner Reviews</p>
          <p className="text-sm font-semibold text-foreground-800 mt-0.5">
            {reviews.learner.length > 0 ? reviews.learner.length : "None yet"}
          </p>
        </div>
        <div className="p-2.5 bg-background-100 rounded-lg">
          <p className="text-xs text-foreground-500">Employer Reviews</p>
          <p className="text-sm font-semibold text-foreground-800 mt-0.5">
            {reviews.employer.length > 0 ? reviews.employer.length : "None yet"}
          </p>
        </div>
        <div className="p-2.5 bg-background-100 rounded-lg">
          <p className="text-xs text-foreground-500">Delivery</p>
          <p className="text-sm font-semibold text-foreground-800 mt-0.5 truncate">
            {provider.delivery_model.split(" ")[0]}
          </p>
        </div>
      </div>

      {/* Best for tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {provider.best_for.slice(0, 3).map((bf, i) => (
          <span
            key={i}
            className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-md font-medium"
          >
            {bf}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-auto pt-3 border-t border-background-200/70 flex items-center gap-2">
        <Link
          to={`/provider/${provider.provider_id}`}
          className="btn btn-sm btn-secondary flex-1"
        >
          View profile
          <i className="ri-arrow-right-line ml-1" />
        </Link>
        <Link
          to={`/compare?providers=${provider.provider_id}`}
          className="btn btn-sm btn-primary flex-1"
        >
          Compare
          <i className="ri-arrow-left-right-line ml-1" />
        </Link>
      </div>
    </div>
  );
}