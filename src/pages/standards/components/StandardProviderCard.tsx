import { Link } from "react-router-dom";
import type { Provider } from "@/mocks/providers";
import { getProviderScore } from "@/mocks/scores";
import { getProviderReviews } from "@/mocks/reviews";

interface StandardProviderCardProps {
  provider: Provider;
  standardId: string;
}

export default function StandardProviderCard({ provider, standardId }: StandardProviderCardProps) {
  const score = getProviderScore(provider.provider_id);
  const reviews = getProviderReviews(provider.provider_id);

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
        <span
          className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
            provider.verification_status === "Verified"
              ? "bg-primary-50 text-primary-700"
              : "bg-secondary-50 text-secondary-600"
          }`}
        >
          <i
            className={`text-xs ${
              provider.verification_status === "Verified" ? "ri-shield-check-line" : "ri-time-line"
            }`}
          />
          {provider.verification_status}
        </span>
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
          className="flex-1 px-4 py-2 bg-background-100 text-foreground-700 text-xs font-semibold rounded-full hover:bg-background-200 transition-colors text-center whitespace-nowrap"
        >
          View profile
          <i className="ri-arrow-right-line ml-1" />
        </Link>
        <Link
          to={`/compare?providers=${provider.provider_id}`}
          className="flex-1 px-4 py-2 bg-primary-500 text-white text-xs font-semibold rounded-full hover:bg-primary-600 transition-colors text-center whitespace-nowrap"
        >
          Compare
          <i className="ri-arrow-left-right-line ml-1" />
        </Link>
      </div>
    </div>
  );
}