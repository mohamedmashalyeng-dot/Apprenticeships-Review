import { useState, useRef, useEffect, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import AuthModal from "@/components/feature/AuthModal";
import { getCompanies } from "@/services/companies.service";
import { getStandards } from "@/services/standards.service";
import { getRatingCategories } from "@/services/ratings.service";
import { submitReview } from "@/services/reviews.service";
import { submitClaim } from "@/services/claims.service";
import { useAuth, getApiErrorMessage } from "@/contexts/AuthContext";
import type { Provider } from "@/types/provider";
import type { Standard } from "@/types/standard";
import type { RatingCategory } from "@/types/rating";

type FormStatus = "idle" | "submitting" | "success" | "error";

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="w-8 h-8 flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
          aria-label={`Rate ${star} out of 5`}
        >
          <i
            className={`text-lg ${
              star <= (hover || value)
                ? "ri-star-fill text-primary-500"
                : "ri-star-line text-white/70"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function AddReview() {
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formError, setFormError] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [recommend, setRecommend] = useState<"yes" | "no" | "">("");
  const [consent, setConsent] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [providerChoice, setProviderChoice] = useState(() => searchParams.get("provider") ?? "");
  const [providerSearch, setProviderSearch] = useState("");
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"review" | "add-provider" | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const providerFieldRef = useRef<HTMLDivElement>(null);

  // Inline "add this provider" mini-form, shown right here instead of sending people to a
  // separate page — website + role are the only extra fields; name/contact/email are reused.
  const [newProviderName, setNewProviderName] = useState("");
  const [newProviderWebsite, setNewProviderWebsite] = useState("");
  const [newProviderRole, setNewProviderRole] = useState("");
  const [claimStatus, setClaimStatus] = useState<FormStatus>("idle");
  const [claimError, setClaimError] = useState("");

  const [providers, setProviders] = useState<Provider[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [ratingCategories, setRatingCategories] = useState<RatingCategory[]>([]);

  useEffect(() => {
    Promise.all([getCompanies(), getStandards(), getRatingCategories()]).then(
      ([companiesData, standardsData, categoriesData]) => {
        setProviders(companiesData);
        setStandards(standardsData);
        setRatingCategories(categoriesData);
      }
    );
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot check
    const honeypot = (formData.get("phone_alt") as string || "").trim();
    if (honeypot) {
      setFormStatus("success");
      form.reset();
      setRating(0);
      setRecommend("");
      setConsent(false);
      setCharCount(0);
      setCategoryRatings({});
      setProviderChoice("");
      setProviderSearch("");
      return;
    }

    // Client-side validation
    const reviewerType = formData.get("reviewer_type") as "learner" | "employer" | "";
    const providerId = formData.get("provider_id") as string;
    const standardId = formData.get("standard_id") as string;
    const completionStatus = formData.get("completion_status") as "currently-enrolled" | "completed" | "withdrawn" | "";
    const reviewTitle = (formData.get("review_title") as string || "").trim();
    const reviewText = (formData.get("review_text") as string || "").trim();

    const errors: string[] = [];
    if (!reviewerType) errors.push("Please select whether you are a learner or employer.");
    if (!providerId) errors.push("Please select a provider.");
    if (providerId === "other") errors.push("We can't yet accept reviews for providers not in our directory — please claim/add the provider first, or contact us.");
    if (!standardId) errors.push("Please select an apprenticeship standard.");
    if (!completionStatus) errors.push("Please select your completion status.");
    if (!rating || rating < 1) errors.push("Please rate your experience from 1 to 5.");
    if (!reviewTitle) errors.push("Please enter a review title.");
    if (!reviewText) errors.push("Please write your review.");
    if (reviewText.length > 500) errors.push("Review text must be 500 characters or fewer.");
    if (!consent) errors.push("Please agree to the review verification terms.");

    if (errors.length > 0) {
      setFormError(errors.join(" "));
      return;
    }

    // Require login before publishing
    if (!user) {
      setPendingAction("review");
      setAuthOpen(true);
      return;
    }

    setFormStatus("submitting");

    try {
      await submitReview({
        companySlug: providerId,
        standardSlug: standardId,
        reviewerType: reviewerType as "learner" | "employer",
        rating,
        reviewTitle,
        reviewText,
        completionStatus: completionStatus as "currently-enrolled" | "completed" | "withdrawn",
        wouldRecommend: recommend ? recommend === "yes" : undefined,
        categoryRatings,
      });

      setFormStatus("success");
      form.reset();
      setRating(0);
      setRecommend("");
      setConsent(false);
      setCharCount(0);
      setCategoryRatings({});
      setProviderChoice("");
      setProviderSearch("");
    } catch (err) {
      setFormStatus("error");
      setFormError(getApiErrorMessage(err));
    }
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    if (pendingAction === "add-provider") {
      handleAddProvider();
    } else {
      formRef.current?.requestSubmit();
    }
    setPendingAction(null);
  };

  const handleAddProvider = async () => {
    setClaimError("");
    const effectiveName = (newProviderName || providerSearch).trim();

    if (!effectiveName || !newProviderWebsite.trim() || !newProviderRole.trim()) {
      setClaimError("Please fill in the provider name, website and your role.");
      return;
    }

    // The rest of the review form is filled in above this box — read it the same way
    // handleSubmit does, so requesting the provider submits the review in the same step
    // instead of making the reviewer wait for approval and come back to redo it.
    const formData = formRef.current ? new FormData(formRef.current) : null;
    const reviewerType = (formData?.get("reviewer_type") as "learner" | "employer" | "") || "";
    const standardId = (formData?.get("standard_id") as string) || "";
    const completionStatus =
      (formData?.get("completion_status") as "currently-enrolled" | "completed" | "withdrawn" | "") || "";
    const reviewTitle = ((formData?.get("review_title") as string) || "").trim();
    const reviewText = ((formData?.get("review_text") as string) || "").trim();

    const reviewErrors: string[] = [];
    if (!reviewerType) reviewErrors.push("whether you're a learner or employer");
    if (!rating || rating < 1) reviewErrors.push("your rating");
    if (!reviewTitle) reviewErrors.push("a review title");
    if (!reviewText) reviewErrors.push("your review text");
    if (!consent) reviewErrors.push("your agreement to the verification terms");
    if (reviewErrors.length > 0) {
      setClaimError(`Please also fill in ${reviewErrors.join(", ")} above before requesting this provider.`);
      return;
    }

    if (!user) {
      setPendingAction("add-provider");
      setAuthOpen(true);
      return;
    }

    setClaimStatus("submitting");
    try {
      const claim = await submitClaim({
        organisationName: effectiveName,
        contactName: user.displayName || user.email,
        email: user.email,
        role: newProviderRole.trim(),
        website: newProviderWebsite.trim(),
        verificationDetails: "Submitted via the add-review \"provider isn't listed\" form.",
      });

      try {
        await submitReview({
          pendingClaimId: claim.id,
          standardSlug: standardId || undefined,
          reviewerType: reviewerType as "learner" | "employer",
          rating,
          reviewTitle,
          reviewText,
          completionStatus: (completionStatus as "currently-enrolled" | "completed" | "withdrawn") || undefined,
          wouldRecommend: recommend ? recommend === "yes" : undefined,
          categoryRatings,
        });
      } catch (reviewErr) {
        // The provider request itself went through — only the review side failed. Don't lose
        // that, just say so plainly instead of claiming full success.
        setClaimStatus("error");
        setClaimError(
          `Your provider request was sent, but we couldn't attach your review: ${getApiErrorMessage(reviewErr)}`
        );
        return;
      }

      // Both the claim and the review are in — reuse the same top-level success state as a
      // normal review submission, since from here on that's exactly what this is.
      setClaimStatus("success");
      setFormStatus("success");
      formRef.current?.reset();
      setRating(0);
      setRecommend("");
      setConsent(false);
      setCharCount(0);
      setCategoryRatings({});
      setProviderChoice("");
      setProviderSearch("");
      setNewProviderName("");
      setNewProviderWebsite("");
      setNewProviderRole("");
    } catch (err) {
      setClaimStatus("error");
      setClaimError(getApiErrorMessage(err));
    }
  };

  const providerOptions = providers.map((p) => ({
    value: p.provider_id,
    label: `${p.trading_name} (${p.legal_name})`,
  }));

  const filteredProviderOptions = providerSearch.trim()
    ? providerOptions.filter((o) => o.label.toLowerCase().includes(providerSearch.trim().toLowerCase()))
    : providerOptions;

  // Pre-fill the search box when a provider comes in via ?provider= or after providers load.
  useEffect(() => {
    if (!providerChoice) return;
    const match = providerOptions.find((o) => o.value === providerChoice);
    if (match) setProviderSearch(match.label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerChoice, providers]);

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!providerDropdownOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (providerFieldRef.current && !providerFieldRef.current.contains(event.target as Node)) {
        setProviderDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [providerDropdownOpen]);

  const selectProvider = (value: string, label: string) => {
    setProviderChoice(value);
    setProviderSearch(label);
    setProviderDropdownOpen(false);
  };

  const standardOptions = standards.map((s) => ({
    value: s.standard_id,
    label: `${s.standard_name} Level ${s.level}`,
  }));

  const completionOptions = [
    { value: "currently-enrolled", label: "Currently Enrolled" },
    { value: "completed", label: "Completed" },
    { value: "withdrawn", label: "Withdrawn / Did Not Complete" },
  ];

  return (
    <div className="min-h-screen bg-background-50 overflow-x-hidden">
      <Navbar />

      {/* Hero — polished, same design language as home */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://readdy.ai/api/search-image?query=A%20smiling%20professional%20typing%20a%20review%20on%20a%20laptop%20while%20colleagues%20collaborate%20in%20the%20background%20of%20a%20bright%20modern%20office%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20amber%20tones%20with%20teal%20accents%2C%20candid%20teamwork%20moment%2C%20editorial%20photography%2C%20shallow%20depth%20of%20field%2C%20high%20detail%2C%20realistic%20trustworthy%20professional%20atmosphere&width=1800&height=900&seq=add-review-hero&orientation=landscape&nocache=true"
            alt="Abstract background representing sharing reviews"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 pt-20 pb-14 md:pt-28 md:pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.08] tracking-tight">
              Share your experience{" "}
              <span className="text-primary-400">& help others choose</span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-white/90 max-w-xl mx-auto leading-relaxed">
              Your honest review helps future learners and employers make
              better apprenticeship decisions. Every review is verified before
              publication.
            </p>

            {/* Trust line */}
            <div className="mt-5 flex items-center justify-center gap-1.5 text-sm text-white/85">
              <i className="ri-shield-check-line text-primary-400" />
              <span>Independent. Transparent. Built for the apprenticeship community.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="w-full px-4 md:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 md:p-8 bg-background-50 border border-background-200/70 rounded-2xl shadow-[0_4px_20px_rgba(7,27,58,0.04)]">
            {/* Status messages */}
            {formStatus === "success" && (
              <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-950/40 border border-primary-100/50 dark:border-primary-800/40 rounded-lg flex items-start gap-3">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-primary-50 text-primary-500">
                  <i className="ri-check-line text-base" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground-900">Review submitted!</p>
                  <p className="text-xs text-foreground-600 mt-0.5">
                    Thank you for sharing your experience. Your review will be reviewed by our
                    verification team before being published.
                  </p>
                </div>
              </div>
            )}

            {formStatus === "error" && formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-red-100 text-red-600">
                  <i className="ri-error-warning-line text-base" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800">Could not submit review</p>
                  <p className="text-xs text-red-600 mt-0.5">{formError}</p>
                </div>
              </div>
            )}

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
              className="space-y-6"
            >
              {/* Anti-spam honeypot */}
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="phone_alt">Phone</label>
                <input type="text" id="phone_alt" name="phone_alt" tabIndex={-1} autoComplete="off" readOnly />
              </div>

              {/* Reviewer type */}
              <div>
                <label className="block text-sm font-semibold text-foreground-900 mb-2">
                  I am a<span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <label className="flex-1 flex items-center gap-3 p-4 bg-background-100 border border-background-200/70 rounded-lg cursor-pointer hover:border-primary-300 transition-colors has-[:checked]:border-primary-400 has-[:checked]:bg-primary-50/50">
                    <input
                      type="radio"
                      name="reviewer_type"
                      value="learner"
                      className="w-4 h-4 text-primary-500 accent-primary-500"
                      required
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground-900">Learner / Apprentice</span>
                      <p className="text-xs text-foreground-500 mt-0.5">I completed or am enrolled in an apprenticeship</p>
                    </div>
                  </label>
                  <label className="flex-1 flex items-center gap-3 p-4 bg-background-100 border border-background-200/70 rounded-lg cursor-pointer hover:border-primary-300 transition-colors has-[:checked]:border-primary-400 has-[:checked]:bg-primary-50/50">
                    <input
                      type="radio"
                      name="reviewer_type"
                      value="employer"
                      className="w-4 h-4 text-primary-500 accent-primary-500"
                      required
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground-900">Employer</span>
                      <p className="text-xs text-foreground-500 mt-0.5">My organisation used this training provider</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Provider */}
              <div className="relative" ref={providerFieldRef}>
                <label htmlFor="provider_search" className="block text-sm font-semibold text-foreground-900 mb-2">
                  Training Provider<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-400 text-sm" />
                  <input
                    id="provider_search"
                    type="text"
                    autoComplete="off"
                    value={providerSearch}
                    onChange={(e) => {
                      setProviderSearch(e.target.value);
                      setProviderChoice("");
                      setProviderDropdownOpen(true);
                    }}
                    onFocus={() => setProviderDropdownOpen(true)}
                    placeholder="Search for your training provider..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-background-100 border border-background-200/70 rounded-lg text-foreground-900 focus:outline-none focus:border-primary-400 transition-colors"
                  />
                </div>
                <input type="hidden" name="provider_id" value={providerChoice} />

                {providerDropdownOpen && (
                  <div className="absolute z-20 mt-1.5 w-full max-h-64 overflow-y-auto bg-background-50 border border-background-200/70 rounded-lg shadow-lg">
                    {filteredProviderOptions.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-foreground-500">No matching providers.</p>
                    ) : (
                      filteredProviderOptions.map((o) => (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => selectProvider(o.value, o.label)}
                          className="block w-full text-left px-4 py-2.5 text-sm text-foreground-800 hover:bg-primary-50 hover:text-primary-700 transition-colors cursor-pointer"
                        >
                          {o.label}
                        </button>
                      ))
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setProviderChoice("other");
                        setProviderDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2.5 text-sm font-medium text-foreground-600 border-t border-background-200/70 hover:bg-background-100 transition-colors cursor-pointer"
                    >
                      My provider isn&apos;t listed
                    </button>
                  </div>
                )}

                {providerChoice === "other" && (
                  <div className="mt-3 p-4 bg-amber-50 border border-amber-200/70 rounded-lg">
                    <p className="text-xs text-amber-700 leading-relaxed mb-3">
                      We can&apos;t yet accept reviews for providers outside our directory, but fill in the
                      details below and your review (from the form above) gets sent along with the request —
                      no need to leave this page or come back later.
                    </p>
                    <div className="flex flex-col gap-2.5">
                      <input
                        type="text"
                        value={newProviderName || providerSearch}
                        onChange={(e) => setNewProviderName(e.target.value)}
                        placeholder="Provider name"
                        className="w-full px-3.5 py-2 text-sm bg-background-50 border border-amber-200 rounded-lg text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                      <input
                        type="url"
                        value={newProviderWebsite}
                        onChange={(e) => setNewProviderWebsite(e.target.value)}
                        placeholder="Provider website (e.g. https://example.com)"
                        className="w-full px-3.5 py-2 text-sm bg-background-50 border border-amber-200 rounded-lg text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                      <input
                        type="text"
                        value={newProviderRole}
                        onChange={(e) => setNewProviderRole(e.target.value)}
                        placeholder="Your connection to this provider (e.g. Apprentice, Employer)"
                        className="w-full px-3.5 py-2 text-sm bg-background-50 border border-amber-200 rounded-lg text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                    {claimError && <p className="text-xs text-red-600 mt-2">{claimError}</p>}
                    <button
                      type="button"
                      onClick={handleAddProvider}
                      disabled={claimStatus === "submitting"}
                      className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-full hover:bg-amber-600 disabled:opacity-60 transition-colors cursor-pointer"
                    >
                      <i className="ri-add-line" />
                      {claimStatus === "submitting" ? "Submitting..." : "Request to add this provider"}
                    </button>
                  </div>
                )}
              </div>

              {/* Apprenticeship standard */}
              <div>
                <label htmlFor="standard_id" className="block text-sm font-semibold text-foreground-900 mb-2">
                  Apprenticeship Standard<span className="text-red-500">*</span>
                </label>
                <select
                  id="standard_id"
                  name="standard_id"
                  required
                  className="w-full px-4 py-2.5 text-sm bg-background-100 border border-background-200/70 rounded-lg text-foreground-900 focus:outline-none focus:border-primary-400 transition-colors cursor-pointer"
                >
                  <option value="">Select a standard...</option>
                  {standardOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Completion status */}
              <div>
                <label htmlFor="completion_status" className="block text-sm font-semibold text-foreground-900 mb-2">
                  Completion Status<span className="text-red-500">*</span>
                </label>
                <select
                  id="completion_status"
                  name="completion_status"
                  required
                  className="w-full px-4 py-2.5 text-sm bg-background-100 border border-background-200/70 rounded-lg text-foreground-900 focus:outline-none focus:border-primary-400 transition-colors cursor-pointer"
                >
                  <option value="">Select status...</option>
                  {completionOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-foreground-900 mb-2">
                  Overall Rating<span className="text-red-500">*</span>
                </label>
                <input type="hidden" name="rating" value={rating || ""} />
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="w-10 h-10 flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                      aria-label={`Rate ${star} out of 5`}
                    >
                      <i
                        className={`text-2xl ${
                          star <= (hoverRating || rating)
                            ? "ri-star-fill text-primary-500"
                            : "ri-star-line text-white/70"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-3 text-sm font-medium text-foreground-600">
                      {rating}/5 {rating === 5 ? "— Excellent" : rating === 4 ? "— Good" : rating === 3 ? "— Average" : rating === 2 ? "— Below Average" : "— Poor"}
                    </span>
                  )}
                </div>
              </div>

              {/* Category ratings */}
              <div>
                <label className="block text-sm font-semibold text-foreground-900 mb-3">
                  Rate your experience
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ratingCategories
                    .filter((cat) => cat.key !== "overall_experience")
                    .map((cat) => (
                      <div key={cat.key} className="p-3 bg-background-100 border border-background-200/70 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-foreground-700 flex items-center gap-1.5">
                            <i className={`${cat.icon} text-primary-500 text-sm`} />
                            {cat.label}
                          </span>
                          <span className="text-xs text-foreground-400">
                            {categoryRatings[cat.key] ? `${categoryRatings[cat.key]}/5` : "—"}
                          </span>
                        </div>
                        <StarInput
                          value={categoryRatings[cat.key] || 0}
                          onChange={(v) => setCategoryRatings((prev) => ({ ...prev, [cat.key]: v }))}
                        />
                      </div>
                    ))}
                </div>
              </div>

              {/* Review title */}
              <div>
                <label htmlFor="review_title" className="block text-sm font-semibold text-foreground-900 mb-2">
                  Review Title<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="review_title"
                  name="review_title"
                  required
                  maxLength={120}
                  placeholder="e.g. Excellent marketing training programme"
                  className="w-full px-4 py-2.5 text-sm bg-background-100 border border-background-200/70 rounded-lg text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>

              {/* Review text */}
              <div>
                <label htmlFor="review_text" className="block text-sm font-semibold text-foreground-900 mb-2">
                  Your Review<span className="text-red-500">*</span>
                </label>
                <textarea
                  id="review_text"
                  name="review_text"
                  required
                  maxLength={500}
                  rows={5}
                  onChange={(e) => setCharCount(e.target.value.length)}
                  placeholder="Share your experience — what was good? What could be improved? How was the tutor support, communication, and workload?"
                  className="w-full px-4 py-3 text-sm bg-background-100 border border-background-200/70 rounded-lg text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors resize-y"
                />
                <p className={`text-xs mt-1 ${charCount > 450 ? "text-amber-600 font-medium" : "text-foreground-400"}`}>
                  {charCount}/500 characters
                </p>
              </div>

              {/* Would recommend */}
              <div>
                <label className="block text-sm font-semibold text-foreground-900 mb-2">
                  Would you recommend this provider?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRecommend("yes")}
                    className={`flex-1 px-4 py-3 text-sm font-medium rounded-full border transition-colors cursor-pointer ${
                      recommend === "yes"
                        ? "bg-primary-50 border-primary-400 text-primary-800"
                        : "bg-background-100 border-background-200/70 text-foreground-600 hover:border-primary-300"
                    }`}
                  >
                    <i className={`${recommend === "yes" ? "ri-thumb-up-fill" : "ri-thumb-up-line"} mr-1.5`} />
                    Yes, I would
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecommend("no")}
                    className={`flex-1 px-4 py-3 text-sm font-medium rounded-full border transition-colors cursor-pointer ${
                      recommend === "no"
                        ? "bg-red-50 border-red-300 text-red-800"
                        : "bg-background-100 border-background-200/70 text-foreground-600 hover:border-red-300"
                    }`}
                  >
                    <i className={`${recommend === "no" ? "ri-thumb-down-fill" : "ri-thumb-down-line"} mr-1.5`} />
                    No, I wouldn&apos;t
                  </button>
                </div>
              </div>

              {/* Consent */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-background-300 text-primary-500 accent-primary-500 cursor-pointer"
                  />
                  <span className="text-xs text-foreground-600 leading-relaxed">
                    I confirm that this is my genuine experience with this training provider. I understand
                    that ApprenticeshipsReviews may verify this review using enrolment evidence, employer
                    confirmation, or email verification. I agree to the{" "}
                    <Link to="/review-policy" className="text-primary-600 hover:text-primary-700 underline">
                      review policy
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                      privacy policy
                    </Link>
                    .<span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={formStatus === "submitting" || formStatus === "success" || authLoading}
                className="w-full py-3 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
              >
                {formStatus === "submitting" ? (
                  <span className="inline-flex items-center gap-2">
                    <i className="ri-loader-4-line animate-spin" />
                    Submitting...
                  </span>
                ) : formStatus === "success" ? (
                  "Review Submitted — Thank You!"
                ) : (
                  "Submit Review"
                )}
              </button>

              {!user && (
                <p className="flex items-center justify-center gap-1.5 text-xs text-foreground-400">
                  <i className="ri-lock-2-line text-sm" />
                  You&apos;ll be asked to log in before your review is published.
                </p>
              )}
            </form>

            {/* Verification notice */}
            <div className="mt-8 p-4 bg-background-100 rounded-lg border border-background-200/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
                  <i className="ri-shield-check-line text-base" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground-800">Verification notice</p>
                  <p className="text-xs text-foreground-500 mt-1 leading-relaxed">
                    To protect review quality, ApprenticeshipsReviews may verify reviews using enrolment
                    evidence, employer confirmation, or email verification. Fake reviews, paid reviews, and
                    manipulated ratings are not permitted. Reviews are moderated before publication and
                    typically appear within 5 working days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits section */}
      <section className="relative w-full px-4 md:px-6 lg:px-8 pb-20 overflow-hidden">
        <div className="absolute -top-24 -left-32 w-[400px] h-[400px] bg-accent-50 rounded-full blur-[100px] pointer-events-none opacity-50" />
        <div className="absolute -bottom-24 -right-32 w-[350px] h-[350px] bg-primary-50/60 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary-600 mb-2">
              Community Impact
            </p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-900">
              Why your review matters
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-background-50 border border-background-200/70 rounded-xl text-center">
              <div className="w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-primary-50 text-primary-500 mb-3">
                <i className="ri-user-heart-line text-lg" />
              </div>
              <h3 className="text-sm font-semibold text-foreground-900">Help future learners</h3>
              <p className="text-xs text-foreground-500 mt-1.5 leading-relaxed">
                Your honest feedback helps prospective apprentices choose the right provider for their
                career goals.
              </p>
            </div>
            <div className="p-5 bg-background-50 border border-background-200/70 rounded-xl text-center">
              <div className="w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-primary-50 text-primary-500 mb-3">
                <i className="ri-building-2-line text-lg" />
              </div>
              <h3 className="text-sm font-semibold text-foreground-900">Guide employers</h3>
              <p className="text-xs text-foreground-500 mt-1.5 leading-relaxed">
                Employer reviews help other organisations select training partners with confidence.
              </p>
            </div>
            <div className="p-5 bg-background-50 border border-background-200/70 rounded-xl text-center">
              <div className="w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-primary-50 text-primary-500 mb-3">
                <i className="ri-bar-chart-2-line text-lg" />
              </div>
              <h3 className="text-sm font-semibold text-foreground-900">Improve quality</h3>
              <p className="text-xs text-foreground-500 mt-1.5 leading-relaxed">
                Your review contributes to transparent, evidence-based quality signals across the
                apprenticeship sector.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <Footer />
    </div>
  );
}
