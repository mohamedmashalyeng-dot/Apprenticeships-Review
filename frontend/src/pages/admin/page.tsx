import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import StarRating from "@/components/base/StarRating";
import LoadingIndicator from "@/components/base/LoadingIndicator";
import ReviewerAvatar from "@/components/base/ReviewerAvatar";
import { getClaims, approveClaim, rejectClaim, type CompanyClaim } from "@/services/claims.service";
import { getReviewsForModeration, getReviewById, moderateReview, deleteReview } from "@/services/reviews.service";
import { getReports, resolveReport, dismissReport, type ReviewReport } from "@/services/reports.service";
import type { Review } from "@/types/review";

interface OpenReport extends ReviewReport {
  review: Review | null;
}

export default function Admin() {
  const [claims, setClaims] = useState<CompanyClaim[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [openReports, setOpenReports] = useState<OpenReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewPendingDelete, setReviewPendingDelete] = useState<Review | null>(null);

  const load = useCallback(() => {
    return Promise.all([
      getClaims("pending").then(setClaims),
      getReviewsForModeration({ moderationStatus: "pending", limit: 50 }).then((r) => setPendingReviews(r.reviews)),
      getReports("open").then(async (reports) => {
        const withReviews = await Promise.all(
          reports.map(async (report) => ({
            ...report,
            review: await getReviewById(report.review_id, { includeUnapproved: true }),
          }))
        );
        setOpenReports(withReviews);
      }),
    ]);
  }, []);

  useEffect(() => {
    load().finally(() => setIsLoading(false));
  }, [load]);

  const loadAllReviews = useCallback((page: number) => {
    setReviewsLoading(true);
    getReviewsForModeration({ page, limit: 20 })
      .then((r) => {
        setAllReviews(r.reviews);
        setReviewsTotalPages(r.totalPages);
      })
      .catch(console.error)
      .finally(() => setReviewsLoading(false));
  }, []);

  useEffect(() => {
    loadAllReviews(reviewsPage);
  }, [loadAllReviews, reviewsPage]);

  const confirmDeleteReview = () => {
    const review = reviewPendingDelete;
    if (!review) return;
    setBusyId(review.review_id);
    deleteReview(review.review_id)
      .then(() => {
        setAllReviews((prev) => prev.filter((r) => r.review_id !== review.review_id));
        setPendingReviews((prev) => prev.filter((r) => r.review_id !== review.review_id));
      })
      .catch(console.error)
      .finally(() => {
        setBusyId(null);
        setReviewPendingDelete(null);
      });
  };

  const handleClaim = (id: string, action: "approve" | "reject") => {
    setBusyId(id);
    const call = action === "approve" ? approveClaim(id) : rejectClaim(id);
    call
      .then(() => setClaims((prev) => prev.filter((c) => c.id !== id)))
      .catch(console.error)
      .finally(() => setBusyId(null));
  };

  const handleReview = (id: string, status: "approved" | "rejected") => {
    setBusyId(id);
    moderateReview(id, status)
      .then(() => setPendingReviews((prev) => prev.filter((r) => r.review_id !== id)))
      .catch(console.error)
      .finally(() => setBusyId(null));
  };

  const handleReport = (id: string, action: "resolve" | "dismiss") => {
    setBusyId(id);
    const call = action === "resolve" ? resolveReport(id) : dismissReport(id);
    call
      .then(() => setOpenReports((prev) => prev.filter((r) => r.id !== id)))
      .catch(console.error)
      .finally(() => setBusyId(null));
  };

  const handleRemoveReportedReview = (report: OpenReport) => {
    if (!report.review) return;
    setBusyId(report.id);
    moderateReview(report.review.review_id, "rejected")
      .then(() => resolveReport(report.id))
      .then(() => setOpenReports((prev) => prev.filter((r) => r.id !== report.id)))
      .catch(console.error)
      .finally(() => setBusyId(null));
  };

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      <section className="w-full bg-background-50 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">Admin</h1>
                <p className="mt-2 text-sm text-foreground-600">
                  Approve provider claims and moderate reviews before they go live.
                </p>
              </div>
              <Link
                to="/competitors"
                className="btn btn-md btn-soft"
              >
                <i className="ri-building-4-line" />
                Provider Intelligence
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-10">
          <div className="max-w-5xl mx-auto flex flex-col gap-10">
            {/* Pending claims */}
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground-900 mb-4">
                Pending provider claims
                {claims.length > 0 && (
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 align-middle">
                    {claims.length}
                  </span>
                )}
              </h2>
              {isLoading ? (
                <LoadingIndicator />
              ) : claims.length === 0 ? (
                <div className="p-6 bg-background-100 rounded-2xl text-center text-sm text-foreground-500">
                  No pending claims.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {claims.map((claim) => (
                    <div key={claim.id} className="p-5 bg-background-50 border border-background-200/70 rounded-2xl">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-sm font-semibold text-foreground-900">
                            {claim.organisation_name}
                            {claim.company_slug && (
                              <span className="ml-2 text-xs font-normal text-foreground-500">
                                (existing listing: {claim.company_slug})
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-foreground-500 mt-1">
                            {claim.contact_name} · {claim.role} · {claim.email}
                          </p>
                          <a
                            href={claim.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary-600 hover:text-primary-700 mt-1 inline-block"
                          >
                            {claim.website}
                          </a>
                          {claim.verification_details && (
                            <p className="text-xs text-foreground-600 mt-2 leading-relaxed">
                              {claim.verification_details}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleClaim(claim.id, "approve")}
                            disabled={busyId === claim.id}
                            className="btn btn-sm btn-primary"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleClaim(claim.id, "reject")}
                            disabled={busyId === claim.id}
                            className="btn btn-sm btn-secondary"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending reviews */}
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground-900 mb-4">
                Pending reviews
                {pendingReviews.length > 0 && (
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 align-middle">
                    {pendingReviews.length}
                  </span>
                )}
              </h2>
              {isLoading ? (
                <LoadingIndicator />
              ) : pendingReviews.length === 0 ? (
                <div className="p-6 bg-background-100 rounded-2xl text-center text-sm text-foreground-500">
                  No pending reviews.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingReviews.map((review) => (
                    <div key={review.review_id} className="p-5 bg-background-50 border border-background-200/70 rounded-2xl">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <ReviewerAvatar name={review.reviewer_name} size="sm" />
                            <span className="text-sm font-semibold text-foreground-900">
                              {review.reviewer_name?.trim() || "Anonymous"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-sm font-bold text-foreground-900">{review.rating.toFixed(1)}</span>
                            <span className="text-xs text-foreground-500">
                              · <Link to={`/provider/${review.provider_id}`} className="hover:text-primary-600">{review.provider_id}</Link>
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-foreground-900">{review.review_title}</h3>
                          <p className="text-sm text-foreground-600 leading-relaxed mt-1">{review.review_text}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleReview(review.review_id, "approved")}
                            disabled={busyId === review.review_id}
                            className="btn btn-sm btn-primary"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(review.review_id, "rejected")}
                            disabled={busyId === review.review_id}
                            className="btn btn-sm btn-secondary"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reported reviews */}
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground-900 mb-4">
                Reported reviews
                {openReports.length > 0 && (
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 align-middle">
                    {openReports.length}
                  </span>
                )}
              </h2>
              {isLoading ? (
                <LoadingIndicator />
              ) : openReports.length === 0 ? (
                <div className="p-6 bg-background-100 rounded-2xl text-center text-sm text-foreground-500">
                  No open reports.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {openReports.map((report) => (
                    <div key={report.id} className="p-5 bg-background-50 border border-background-200/70 rounded-2xl">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
                            Reported: {report.reason}
                          </p>
                          {report.details && (
                            <p className="text-xs text-foreground-600 mb-2">{report.details}</p>
                          )}
                          {report.review ? (
                            <div className="p-3 bg-background-100 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <ReviewerAvatar name={report.review.reviewer_name} size="sm" />
                                <span className="text-sm font-semibold text-foreground-900">
                                  {report.review.reviewer_name?.trim() || "Anonymous"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <StarRating rating={report.review.rating} size="sm" />
                                <span className="text-xs text-foreground-500">
                                  · <Link to={`/provider/${report.review.provider_id}`} className="hover:text-primary-600">
                                    {report.review.provider_id}
                                  </Link>
                                </span>
                              </div>
                              <h3 className="text-sm font-semibold text-foreground-900">{report.review.review_title}</h3>
                              <p className="text-sm text-foreground-600 leading-relaxed mt-1">{report.review.review_text}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-foreground-400 italic">Review no longer exists.</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {report.review && (
                            <button
                              onClick={() => handleRemoveReportedReview(report)}
                              disabled={busyId === report.id}
                              className="btn btn-sm btn-danger"
                            >
                              Remove review
                            </button>
                          )}
                          <button
                            onClick={() => handleReport(report.id, "dismiss")}
                            disabled={busyId === report.id}
                            className="btn btn-sm btn-secondary"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All reviews */}
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground-900 mb-4">All reviews</h2>
              {reviewsLoading ? (
                <LoadingIndicator />
              ) : allReviews.length === 0 ? (
                <div className="p-6 bg-background-100 rounded-2xl text-center text-sm text-foreground-500">
                  No reviews found.
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3">
                    {allReviews.map((review) => (
                      <div key={review.review_id} className="p-5 bg-background-50 border border-background-200/70 rounded-2xl">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <ReviewerAvatar name={review.reviewer_name} size="sm" />
                              <span className="text-sm font-semibold text-foreground-900">
                                {review.reviewer_name?.trim() || "Anonymous"}
                              </span>
                              {review.moderation_status && (
                                <span
                                  className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                                    review.moderation_status === "approved"
                                      ? "bg-green-50 text-green-700"
                                      : review.moderation_status === "rejected"
                                      ? "bg-red-50 text-red-700"
                                      : "bg-yellow-50 text-yellow-700"
                                  }`}
                                >
                                  {review.moderation_status}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <StarRating rating={review.rating} size="sm" />
                              <span className="text-sm font-bold text-foreground-900">{review.rating.toFixed(1)}</span>
                              <span className="text-xs text-foreground-500">
                                · <Link to={`/provider/${review.provider_id}`} className="hover:text-primary-600">{review.provider_id}</Link>
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-foreground-900">{review.review_title}</h3>
                            <p className="text-sm text-foreground-600 leading-relaxed mt-1">{review.review_text}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => setReviewPendingDelete(review)}
                              disabled={busyId === review.review_id}
                              className="btn btn-sm btn-danger"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {reviewsTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-5">
                      <button
                        onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
                        disabled={reviewsPage <= 1}
                        className="px-4 py-2 bg-background-100 text-foreground-700 text-xs font-semibold rounded-full hover:bg-background-200 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Previous
                      </button>
                      <span className="text-xs text-foreground-500 whitespace-nowrap">
                        Page {reviewsPage} of {reviewsTotalPages}
                      </span>
                      <button
                        onClick={() => setReviewsPage((p) => Math.min(reviewsTotalPages, p + 1))}
                        disabled={reviewsPage >= reviewsTotalPages}
                        className="btn btn-sm btn-secondary"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Delete review confirmation modal */}
      {reviewPendingDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => busyId === null && setReviewPendingDelete(null)}
          />
          <div className="relative w-full max-w-sm bg-background-50 rounded-2xl border border-background-200/70 shadow-2xl p-6">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-50 text-red-500 mb-4">
              <i className="ri-delete-bin-line text-xl" />
            </div>
            <h3 className="font-heading text-base font-bold text-foreground-900">Delete this review?</h3>
            <p className="mt-2 text-sm text-foreground-600 leading-relaxed">
              {reviewPendingDelete.review_title ? (
                <>Permanently delete <span className="font-semibold text-foreground-800">&ldquo;{reviewPendingDelete.review_title}&rdquo;</span>?</>
              ) : (
                "Permanently delete this review?"
              )}{" "}
              This cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setReviewPendingDelete(null)}
                disabled={busyId === reviewPendingDelete.review_id}
                className="btn btn-sm btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReview}
                disabled={busyId === reviewPendingDelete.review_id}
                className="btn btn-sm btn-danger"
              >
                {busyId === reviewPendingDelete.review_id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
