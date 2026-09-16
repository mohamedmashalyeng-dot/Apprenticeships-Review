import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { useComparison } from "@/contexts/ComparisonContext";
import { useAuth } from "@/contexts/AuthContext";
import { getCompanies, getCompanyBySlug } from "@/services/companies.service";
import { getCompanyStats, getRatingCategories } from "@/services/ratings.service";
import { getCompanyReviews } from "@/services/reviews.service";
import { getStandards, getCompanyStandards, resolveStandards } from "@/services/standards.service";
import { getSavedProviderIds, saveProvider, unsaveProvider } from "@/services/saved-providers.service";
import ReviewCard from "./components/ReviewCard";
import StarRating from "@/components/base/StarRating";
import VerifiedBadge from "@/components/base/VerifiedBadge";
import LoadingIndicator from "@/components/base/LoadingIndicator";
import type { Provider, ProviderStandardLink } from "@/types/provider";
import type { Review } from "@/types/review";
import type { RatingCategory, ProviderRating } from "@/types/rating";
import type { Standard } from "@/types/standard";

async function findProvider(rawId: string | undefined): Promise<Provider | null> {
  if (!rawId) return null;
  // Try exact match first
  let provider = await getCompanyBySlug(rawId);
  if (provider) return provider;
  // Try URL-decoded match
  const decoded = decodeURIComponent(rawId);
  if (decoded !== rawId) {
    provider = await getCompanyBySlug(decoded);
    if (provider) return provider;
  }
  return null;
}

function ProviderNotFound({ attemptedId }: { attemptedId: string }) {
  const [search, setSearch] = useState("");
  const [allProviders, setAllProviders] = useState<Provider[]>([]);

  useEffect(() => {
    getCompanies().then(setAllProviders);
  }, []);

  const suggested = useMemo(() => {
    if (!search.trim()) return allProviders.slice(0, 6);
    const q = search.toLowerCase();
    return allProviders.filter(
      (p) =>
        p.trading_name.toLowerCase().includes(q) ||
        p.legal_name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.UKPRN.includes(q)
    );
  }, [search, allProviders]);

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />
      <div className="w-full px-4 md:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-background-100 text-foreground-400 mb-6">
            <i className="ri-search-2-line text-2xl" />
          </div>

          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
            We couldn&apos;t find that provider
          </h1>
          <p className="mt-2 text-foreground-600 text-sm md:text-base">
            The provider <strong className="text-foreground-900">&quot;{attemptedId}&quot;</strong> doesn&apos;t exist in our directory.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-lg mx-auto">
            <div className="relative">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-foreground-400 text-sm" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a provider..."
                className="w-full pl-11 pr-4 py-3 text-sm bg-background-100 border border-background-200/70 rounded-xl text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>
          </div>

          {/* Suggested providers */}
          <div className="mt-8 text-left max-w-lg mx-auto">
            <p className="text-xs font-semibold text-foreground-500 mb-3 uppercase tracking-wider">
              {search.trim() ? "Search results" : "Popular providers to explore"}
            </p>
            <div className="flex flex-col gap-2">
              {suggested.map((p) => (
                <Link
                  key={p.provider_id}
                  to={`/provider/${p.provider_id}`}
                  className="flex items-center justify-between p-4 bg-background-100 border border-background-200/70 rounded-xl hover:border-primary-200 hover:bg-background-50 transition-all"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground-900">{p.trading_name}</p>
                    <p className="text-xs text-foreground-500 mt-0.5">
                      {p.legal_name} · {p.location}
                    </p>
                  </div>
                  <span className="text-xs text-primary-600 font-medium flex items-center gap-1">
                    View profile
                    <i className="ri-arrow-right-line text-xs" />
                  </span>
                </Link>
              ))}
              {suggested.length === 0 && (
                <div className="p-6 bg-background-100 rounded-xl text-center">
                  <p className="text-sm text-foreground-500">No providers match your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/compare"
              className="w-full sm:w-auto px-6 py-3 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors whitespace-nowrap"
            >
              Compare All Providers
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 bg-background-100 text-foreground-700 text-sm font-semibold rounded-full hover:bg-background-200 transition-colors whitespace-nowrap"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ProviderProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [provider, setProvider] = useState<Provider | null>(null);
  const { choices, toggle } = useComparison();
  const [learnerLimit, setLearnerLimit] = useState(6);
  const [employerLimit, setEmployerLimit] = useState(6);
  const [providerRating, setProviderRating] = useState<ProviderRating | null>(null);
  const [ratingCategories, setRatingCategories] = useState<RatingCategory[]>([]);
  const [reviews, setReviews] = useState<{ learner: Review[]; employer: Review[] }>({ learner: [], employer: [] });
  const [matchedStandards, setMatchedStandards] = useState<Array<ProviderStandardLink & { standard: Standard }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isTogglingSave, setIsTogglingSave] = useState(false);

  useEffect(() => {
    if (!user || !provider) {
      setIsSaved(false);
      return;
    }
    getSavedProviderIds()
      .then((ids) => setIsSaved(ids.includes(provider.provider_id)))
      .catch(console.error);
  }, [user, provider]);

  const handleToggleSave = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!provider) return;
    setIsTogglingSave(true);
    const call = isSaved ? unsaveProvider(provider.provider_id) : saveProvider(provider.provider_id);
    call
      .then(() => setIsSaved((prev) => !prev))
      .catch(console.error)
      .finally(() => setIsTogglingSave(false));
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setNotFound(false);
      setLearnerLimit(6);
      setEmployerLimit(6);

      const p = await findProvider(id);
      if (cancelled) return;

      if (!p) {
        setProvider(null);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setProvider(p);

      try {
        const [ratingData, categoriesData, reviewsData, providerStds, allStandards] = await Promise.all([
          getCompanyStats(p.provider_id),
          getRatingCategories(),
          getCompanyReviews(p.provider_id),
          getCompanyStandards(p.provider_id),
          getStandards(),
        ]);

        if (cancelled) return;

        setProviderRating(ratingData);
        setRatingCategories(categoriesData);
        setReviews(reviewsData);

        setMatchedStandards(resolveStandards(providerStds, allStandards));
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-50">
        <Navbar />
        <div className="py-24">
          <LoadingIndicator />
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !provider) {
    return <ProviderNotFound attemptedId={id || "unknown"} />;
  }

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* ===== 1. PROVIDER HEADER ===== */}
      <section className="w-full bg-background-50 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-foreground-500 mb-6">
              <Link to="/home" className="hover:text-foreground-700">Home</Link>
              <i className="ri-arrow-right-s-line" />
              <Link to="/providers" className="hover:text-foreground-700">Providers</Link>
              <i className="ri-arrow-right-s-line" />
              <span className="text-foreground-900 font-medium">{provider.trading_name}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                    {provider.trading_name}
                  </h1>
                  {provider.verification_status === "Verified" && <VerifiedBadge size="md" />}
                </div>
                <p className="text-sm text-foreground-600">{provider.legal_name}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-foreground-600">
                  <span className="flex items-center gap-1.5">
                    <i className="ri-government-line text-foreground-400" />
                    UKPRN: <strong className="text-foreground-800">{provider.UKPRN}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="ri-map-pin-line text-foreground-400" />
                    {provider.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="ri-building-4-line text-foreground-400" />
                    Ofsted: <strong className="text-foreground-800">{provider.Ofsted_status}</strong>
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center lg:items-end gap-2">
                {providerRating && providerRating.review_count > 0 && <a href="#ratings" className="mb-2 flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700">
                  <StarRating rating={providerRating.overall} size="sm" />
                  <strong>{providerRating.overall.toFixed(1)}</strong>
                  <span>({providerRating.review_count.toLocaleString()} reviews)</span>
                </a>}
                <div className="w-full sm:w-auto flex items-center gap-2">
                  <button
                    onClick={handleToggleSave}
                    disabled={isTogglingSave}
                    aria-label={isSaved ? "Remove from saved providers" : "Save provider"}
                    className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border transition-colors cursor-pointer disabled:opacity-60 ${
                      isSaved
                        ? "bg-primary-50 border-primary-200 text-primary-600"
                        : "bg-background-50 border-background-200/70 text-foreground-500 hover:bg-background-100"
                    }`}
                  >
                    <i className={isSaved ? "ri-bookmark-fill" : "ri-bookmark-line"} />
                  </button>
                  <button
                    type="button"
                    aria-pressed={choices.some((item) => item.id === provider.provider_id)}
                    disabled={choices.length >= 3 && !choices.some((item) => item.id === provider.provider_id)}
                    onClick={() => toggle({ id: provider.provider_id, name: provider.trading_name })}
                    className="flex-1 rounded-full border border-primary-200 bg-primary-50 px-5 py-3 text-sm font-semibold text-primary-700 disabled:opacity-50"
                  >
                    {choices.some((item) => item.id === provider.provider_id) ? "Remove from comparison" : choices.length >= 3 ? "Comparison full (3/3)" : "Add to comparison"}
                  </button>
                </div>
                <Link
                  to={`/add-review?provider=${encodeURIComponent(provider.provider_id)}`}
                  className="w-full sm:w-auto px-6 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors text-center whitespace-nowrap"
                >
                  <i className="ri-pencil-line mr-1.5" />
                  Write a Review
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <nav aria-label="On this provider profile" className="border-b border-background-200 bg-background-50">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3">
          {[["overview", "Overview"], ...(providerRating && providerRating.review_count > 0 ? [["ratings", "Ratings"]] : []), ["programmes", "Programmes"], ["learner-reviews", "Learner reviews"], ["employer-reviews", "Employer reviews"]].map(([anchor, label]) => <a key={anchor} href={`#${anchor}`} className="shrink-0 rounded-lg px-4 py-3 text-sm font-medium text-foreground-700 hover:bg-primary-50 hover:text-primary-700">{label}</a>)}
        </div>
      </nav>

      {/* ===== RATING SUMMARY ===== */}
      {providerRating && providerRating.review_count > 0 && (
        <section id="ratings" className="scroll-mt-24 w-full bg-background-50 border-b border-background-200/70">
          <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-12">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Overall rating */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center text-center p-6 bg-background-100 rounded-2xl">
                <StarRating rating={providerRating.overall} size="lg" />
                <p className="text-4xl font-heading font-bold text-foreground-950 mt-2">{providerRating.overall.toFixed(1)}</p>
                <p className="text-sm text-foreground-500 mt-1">{providerRating.review_count} review{providerRating.review_count !== 1 ? "s" : ""}</p>
                {providerRating.recommendation_percent != null && (
                  <p className="text-sm font-semibold text-primary-600 mt-2">{providerRating.recommendation_percent}% recommend</p>
                )}
              </div>

              {/* Distribution */}
              <div className="lg:col-span-2 flex flex-col justify-center">
                <h3 className="font-heading text-sm font-semibold text-foreground-800 mb-4">Rating distribution</h3>
                <div className="flex flex-col gap-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = providerRating.distribution[star] ?? 0;
                    const pct = providerRating.review_count > 0 ? (count / providerRating.review_count) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-foreground-600 w-9 flex items-center gap-0.5">
                          {star}
                          <i className="ri-star-fill text-primary-500 text-[10px]" />
                        </span>
                        <div className="flex-1 h-2 bg-background-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-foreground-500 w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Category ratings */}
            {ratingCategories.some((cat) => providerRating.categories[cat.key] != null) && <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-background-200/60">
              <h3 className="font-heading text-sm font-semibold text-foreground-800 mb-5">Rating categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                {ratingCategories.filter((cat) => providerRating.categories[cat.key] != null).map((cat) => {
                  const val = providerRating.categories[cat.key] ?? 0;
                  const pct = (val / 5) * 100;
                  return (
                    <div key={cat.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-foreground-600 flex items-center gap-1.5">
                          <i className={`${cat.icon} text-primary-500 text-xs`} />
                          {cat.label}
                        </span>
                        <span className="text-xs font-semibold text-foreground-900">{val.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 bg-background-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>}
          </div>
        </section>
      )}

      <section id="overview" className="scroll-mt-24 bg-background-100 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-5 font-heading text-xl font-bold text-foreground-950">Provider overview</h2>
          {provider.description && <p className="mb-6 max-w-3xl text-sm leading-relaxed text-foreground-600">{provider.description}</p>}
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Programmes listed", matchedStandards.length ? String(matchedStandards.length) : null],
              ["Reviews", providerRating?.review_count ? providerRating.review_count.toLocaleString() : null],
              ["Delivery model", provider.delivery_model],
              ["Last updated", provider.data_last_updated],
            ].filter(([, value]) => value).map(([label, value]) => <div key={label} className="rounded-xl border border-background-200 bg-background-50 p-4"><dt className="mb-2 text-xs text-foreground-500">{label}</dt><dd className="text-sm font-semibold text-foreground-900">{value}</dd></div>)}
          </dl>
        </div>
      </section>

      {/* ===== 4. APPRENTICESHIP STANDARDS TABLE ===== */}
      <section id="programmes" className="scroll-mt-24 w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-xl font-bold text-foreground-950 mb-6">Apprenticeship Standards Offered</h2>
            {matchedStandards.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-background-200 text-left">
                      <th className="py-3 px-4 font-semibold text-foreground-700 text-xs">Standard Name</th>
                      <th className="py-3 px-4 font-semibold text-foreground-700 text-xs hidden sm:table-cell">Level</th>
                      <th className="py-3 px-4 font-semibold text-foreground-700 text-xs hidden md:table-cell">Sector</th>
                      <th className="py-3 px-4 font-semibold text-foreground-700 text-xs">Status</th>
                      <th className="py-3 px-4 font-semibold text-foreground-700 text-xs text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchedStandards.map((ps) => (
                      <tr key={ps.standard_id} className="border-b border-background-100 hover:bg-background-50 transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            to={`/standards/${ps.standard_id}`}
                            className="font-medium text-primary-600 hover:text-primary-700"
                          >
                            {ps.standard.standard_name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-foreground-600 hidden sm:table-cell">
                          <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-md font-medium">
                            Level {ps.standard.level}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-foreground-600 hidden md:table-cell">{ps.standard.sector}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 rounded-md text-xs font-medium">
                            <i className="ri-check-line text-xs" />
                            {ps.delivery_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/compare?providers=${provider.provider_id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap"
                          >
                            Compare
                            <i className="ri-arrow-right-line text-xs" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-foreground-500 py-8 text-center bg-background-100 rounded-lg">
                No apprenticeship standards data available for this provider.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ===== 5. LEARNER REVIEWS ===== */}
      <section id="learner-reviews" className="scroll-mt-24 w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground-950">Learner Reviews</h2>
                <p className="mt-1 text-sm text-foreground-600">
                  {reviews.learner.length > 0
                    ? `Based on ${reviews.learner.length} learner review${reviews.learner.length > 1 ? "s" : ""}`
                    : "No learner reviews submitted yet."}
                </p>
              </div>
            </div>
            {reviews.learner.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.learner.slice(0, learnerLimit).map((review) => (
                  <ReviewCard key={review.review_id} {...review} reviewerType="learner" />
                ))}
                {reviews.learner.length > learnerLimit && <button type="button" onClick={() => setLearnerLimit((value) => value + 6)} className="rounded-xl border border-primary-200 px-5 py-3 text-sm font-semibold text-primary-600 md:col-span-2">Show more learner reviews</button>}
              </div>
            ) : (
              <div className="p-10 bg-background-50 rounded-xl border border-background-200/70 text-center">
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-background-200 text-foreground-400 mb-3">
                  <i className="ri-chat-3-line text-xl" />
                </div>
                <p className="text-sm font-medium text-foreground-700">No learner reviews yet.</p>
                <p className="mt-1 text-xs text-foreground-500">Be the first to share your experience.</p>
                <Link
                  to={`/add-review?provider=${encodeURIComponent(provider.provider_id)}`}
                  className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors"
                >
                  Add a Review
                  <i className="ri-arrow-right-line" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== 6. EMPLOYER REVIEWS ===== */}
      <section id="employer-reviews" className="scroll-mt-24 w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground-950">Employer Reviews</h2>
                <p className="mt-1 text-sm text-foreground-600">
                  {reviews.employer.length > 0
                    ? `Based on ${reviews.employer.length} employer review${reviews.employer.length > 1 ? "s" : ""}`
                    : "No employer reviews submitted yet."}
                </p>
              </div>
            </div>
            {reviews.employer.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.employer.slice(0, employerLimit).map((review) => (
                  <ReviewCard key={review.review_id} {...review} reviewerType="employer" />
                ))}
                {reviews.employer.length > employerLimit && <button type="button" onClick={() => setEmployerLimit((value) => value + 6)} className="rounded-xl border border-primary-200 px-5 py-3 text-sm font-semibold text-primary-600 md:col-span-2">Show more employer reviews</button>}
              </div>
            ) : (
              <div className="p-10 bg-background-100 rounded-xl border border-background-200/70 text-center">
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-background-200 text-foreground-400 mb-3">
                  <i className="ri-building-2-line text-xl" />
                </div>
                <p className="text-sm font-medium text-foreground-700">No employer reviews yet.</p>
                <p className="mt-1 text-xs text-foreground-500">Employer feedback helps others choose the right training partner.</p>
                <Link
                  to={`/add-review?provider=${encodeURIComponent(provider.provider_id)}`}
                  className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors"
                >
                  Add a Review
                  <i className="ri-arrow-right-line" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== 7. STRENGTHS & WEAKNESSES ===== */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-xl font-bold text-foreground-950 mb-6">Strengths &amp; Areas for Development</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="p-6 bg-background-50 rounded-xl border border-background-200/70">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <i className="ri-thumb-up-line" />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-foreground-900">Strengths</h3>
                </div>
                {provider.strengths.length > 0 ? (
                  <ul className="flex flex-col gap-2.5">
                    {provider.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-foreground-700">
                        <i className="ri-check-line text-primary-500 mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-foreground-500">Not Publicly Available</p>
                )}
              </div>
              {/* Weaknesses */}
              <div className="p-6 bg-background-50 rounded-xl border border-background-200/70">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary-50 text-secondary-600">
                    <i className="ri-error-warning-line" />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-foreground-900">Areas for Development</h3>
                </div>
                {provider.weaknesses.length > 0 ? (
                  <ul className="flex flex-col gap-2.5">
                    {provider.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-foreground-700">
                        <i className="ri-arrow-right-line text-secondary-500 mt-0.5 flex-shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-foreground-500">Not Publicly Available</p>
                )}
              </div>
            </div>

            {/* About provider */}
            <div className="mt-6 p-6 bg-background-50 rounded-xl border border-background-200/70">
              <h3 className="font-heading text-base font-semibold text-foreground-900 mb-3">About {provider.trading_name}</h3>
              <p className="text-sm text-foreground-600 leading-relaxed">{provider.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {provider.best_for.map((bf, i) => (
                  <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                    {bf}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 8. COMPARE CTA ===== */}
      <section className="w-full bg-primary-600">
        <div className="w-full px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to compare {provider.trading_name}?
            </h2>
            <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              See how {provider.trading_name} compares to other providers on evidence scores, reviews, delivery models, and apprenticeship standards.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={`/compare?providers=${provider.provider_id}`}
                className="w-full sm:w-auto px-8 py-3.5 bg-background-50 text-primary-700 text-sm font-semibold rounded-full hover:bg-background-100 transition-colors whitespace-nowrap"
              >
                Compare this provider
                <i className="ri-arrow-left-right-line ml-1.5" />
              </Link>
              <Link
                to={`/add-review?provider=${encodeURIComponent(provider.provider_id)}`}
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white text-sm font-semibold rounded-full border border-background-50/30 hover:bg-background-50/10 transition-colors whitespace-nowrap"
              >
                Leave a review
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}