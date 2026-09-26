import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import StarRating from "@/components/base/StarRating";
import VerifiedBadge from "@/components/base/VerifiedBadge";
import LoadingIndicator from "@/components/base/LoadingIndicator";
import ReviewerAvatar from "@/components/base/ReviewerAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/lib/api/client";
import { getMyReviews, updateReview } from "@/services/reviews.service";
import { getCompanies } from "@/services/companies.service";
import { getRatingCategories } from "@/services/ratings.service";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/services/notifications.service";
import { getSavedProviderIds, unsaveProvider } from "@/services/saved-providers.service";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import type { Review } from "@/types/review";
import type { Provider } from "@/types/provider";
import type { RatingCategory } from "@/types/rating";
import type { AppNotification, NotificationType } from "@/types/notification";

type Tab = "reviews" | "saved" | "settings" | "notifications";

const notificationIcons: Record<NotificationType, { icon: string; color: string }> = {
  review_approved: { icon: "ri-check-line", color: "bg-primary-50 text-primary-600" },
  review_rejected: { icon: "ri-close-line", color: "bg-red-50 text-red-600" },
  review_response: { icon: "ri-message-2-line", color: "bg-accent-100 text-accent-700" },
  claim_approved: { icon: "ri-shield-check-line", color: "bg-primary-50 text-primary-600" },
  claim_rejected: { icon: "ri-close-line", color: "bg-red-50 text-red-600" },
  new_review_for_company: { icon: "ri-chat-quote-line", color: "bg-secondary-100 text-secondary-600" },
};

const validTabs: Tab[] = ["reviews", "saved", "settings", "notifications"];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
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
          <i className={`text-xl ${star <= (hover || value) ? "ri-star-fill text-primary-500" : "ri-star-line text-foreground-300"}`} />
        </button>
      ))}
    </div>
  );
}

function EditReviewModal({
  review,
  ratingCategories,
  onClose,
  onSaved,
}: {
  review: Review;
  ratingCategories: RatingCategory[];
  onClose: () => void;
  onSaved: (updated: Review) => void;
}) {
  const [rating, setRating] = useState(review.rating);
  const [title, setTitle] = useState(review.review_title);
  const [text, setText] = useState(review.review_text);
  const [wouldRecommend, setWouldRecommend] = useState<"yes" | "no" | "">(
    review.would_recommend === true ? "yes" : review.would_recommend === false ? "no" : ""
  );
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>(review.category_ratings ?? {});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    const trimmedTitle = title.trim();
    const trimmedText = text.trim();
    if (!rating) return setError("Please rate your experience from 1 to 5.");
    if (!trimmedTitle) return setError("Please enter a review title.");
    if (!trimmedText) return setError("Please write your review.");
    if (trimmedText.length > 500) return setError("Review text must be 500 characters or fewer.");

    setIsSaving(true);
    try {
      const updated = await updateReview(review.review_id, {
        rating,
        reviewTitle: trimmedTitle,
        reviewText: trimmedText,
        wouldRecommend: wouldRecommend ? wouldRecommend === "yes" : undefined,
        categoryRatings,
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't save your changes. Please try again."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-background-50 border border-background-200/70 rounded-2xl p-6 md:p-7 my-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-bold text-foreground-900">Edit your review</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-full text-foreground-400 hover:bg-background-100 hover:text-foreground-700 cursor-pointer"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground-900 mb-2">Overall rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {ratingCategories.filter((cat) => cat.key !== "overall_experience").length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-foreground-900 mb-2">Rate your experience</label>
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
                      <StarPicker
                        value={categoryRatings[cat.key] || 0}
                        onChange={(v) => setCategoryRatings((prev) => ({ ...prev, [cat.key]: v }))}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="edit-review-title" className="block text-sm font-semibold text-foreground-900 mb-2">
              Review title
            </label>
            <input
              id="edit-review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="w-full px-4 py-2.5 text-sm bg-background-100 border border-background-200/70 rounded-lg text-foreground-900 focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="edit-review-text" className="block text-sm font-semibold text-foreground-900 mb-2">
              Your review
            </label>
            <textarea
              id="edit-review-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              rows={5}
              className="w-full px-4 py-3 text-sm bg-background-100 border border-background-200/70 rounded-lg text-foreground-900 focus:outline-none focus:border-primary-400 transition-colors resize-y"
            />
            <p className={`text-xs mt-1 ${text.length > 450 ? "text-amber-600 font-medium" : "text-foreground-400"}`}>
              {text.length}/500 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground-900 mb-2">Would you recommend this provider?</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWouldRecommend("yes")}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-full border transition-colors cursor-pointer ${
                  wouldRecommend === "yes"
                    ? "bg-primary-50 border-primary-400 text-primary-800"
                    : "bg-background-100 border-background-200/70 text-foreground-600 hover:border-primary-300"
                }`}
              >
                <i className={`${wouldRecommend === "yes" ? "ri-thumb-up-fill" : "ri-thumb-up-line"} mr-1.5`} />
                Yes
              </button>
              <button
                type="button"
                onClick={() => setWouldRecommend("no")}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-full border transition-colors cursor-pointer ${
                  wouldRecommend === "no"
                    ? "bg-red-50 border-red-300 text-red-800"
                    : "bg-background-100 border-background-200/70 text-foreground-600 hover:border-red-300"
                }`}
              >
                <i className={`${wouldRecommend === "no" ? "ri-thumb-down-fill" : "ri-thumb-down-line"} mr-1.5`} />
                No
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-lg btn-primary flex-1"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-3 text-sm font-semibold text-foreground-600 hover:text-foreground-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [tab, setTab] = useState<Tab>(
    validTabs.includes(initialTab as Tab) ? (initialTab as Tab) : "reviews"
  );
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [savedProviderIds, setSavedProviderIds] = useState<string[]>([]);
  const [ratingCategories, setRatingCategories] = useState<RatingCategory[]>([]);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    Promise.all([getMyReviews(), getCompanies(), getNotifications(), getSavedProviderIds(), getRatingCategories()])
      .then(([reviews, companies, notifs, savedIds, categories]) => {
        setMyReviews(reviews);
        setProviders(companies);
        setNotifications(notifs);
        setSavedProviderIds(savedIds);
        setRatingCategories(categories);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleReviewUpdated = (updated: Review) => {
    setMyReviews((prev) => prev.map((r) => (r.review_id === updated.review_id ? updated : r)));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotificationClick = (n: AppNotification) => {
    if (!n.is_read) {
      markNotificationRead(n.id).catch(console.error);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
    }
    if (n.link) navigate(n.link);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead().catch(console.error);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleUnsave = (providerId: string) => {
    setSavedProviderIds((prev) => prev.filter((id) => id !== providerId));
    unsaveProvider(providerId).catch(console.error);
  };

  const handleSaveSettings = (e: FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSaved(false);
    updateProfile({ displayName: displayName.trim() })
      .then(() => {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      })
      .catch(console.error)
      .finally(() => setIsSavingSettings(false));
  };

  // ProtectedRoute guarantees a non-null user by the time this renders; this check only
  // satisfies TypeScript's null-checking (and keeps hook call order stable) without
  // changing behaviour.
  if (!user) return null;

  const initials = user.displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "reviews", label: "My Reviews", icon: "ri-chat-quote-line" },
    { id: "saved", label: "Saved Providers", icon: "ri-bookmark-line" },
    { id: "settings", label: "Account Settings", icon: "ri-user-settings-line" },
    { id: "notifications", label: "Notifications", icon: "ri-notification-3-line" },
  ];

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* Header */}
      <section className="w-full bg-background-50 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-10">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary-500 text-white font-bold text-lg">
              {initials}
            </div>
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground-950">{user.displayName || user.email}</h1>
              <p className="text-sm text-foreground-500">Apprentice · Marketing Executive Level 4</p>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-10">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-60 flex-shrink-0">
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      tab === t.id
                        ? "bg-primary-500 text-white"
                        : "bg-background-100 text-foreground-600 hover:bg-background-200"
                    }`}
                  >
                    <i className={t.icon} />
                    {t.label}
                    {t.id === "notifications" && unreadCount > 0 && (
                      <span className={`ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                        tab === t.id ? "bg-white/25 text-white" : "bg-primary-500 text-white"
                      }`}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Reviews */}
              {tab === "reviews" && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground-900 mb-5">My Reviews</h2>
                  <div className="flex flex-col gap-4">
                    {isLoading && <LoadingIndicator />}
                    {myReviews.map((review) => {
                      const provider = providers.find((p) => p.provider_id === review.provider_id);
                      return (
                        <div key={review.review_id} className="p-5 bg-background-50 border border-background-200/70 rounded-2xl">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5">
                              <ReviewerAvatar name={user?.displayName} size="sm" />
                              <span className="text-sm font-semibold text-foreground-900">
                                {user?.displayName?.trim() || "Anonymous"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {review.pending_provider_name ? (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize whitespace-nowrap bg-amber-50 text-amber-700">
                                  Awaiting provider approval
                                </span>
                              ) : (
                                review.moderation_status && (
                                  <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize whitespace-nowrap ${
                                      review.moderation_status === "approved"
                                        ? "bg-green-50 text-green-700"
                                        : review.moderation_status === "rejected"
                                        ? "bg-red-50 text-red-700"
                                        : review.moderation_status === "flagged"
                                        ? "bg-amber-50 text-amber-700"
                                        : "bg-yellow-50 text-yellow-700"
                                    }`}
                                  >
                                    {review.moderation_status === "pending" ? "Pending review" : review.moderation_status}
                                  </span>
                                )
                              )}
                              {review.verification_status === "Verified" && <VerifiedBadge />}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-sm font-bold text-foreground-900">{review.rating.toFixed(1)}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-foreground-900 mb-1">{review.review_title}</h3>
                          <p className="text-sm text-foreground-600 line-clamp-2 mb-3">{review.review_text}</p>
                          <div className="flex items-center justify-between pt-3 border-t border-background-200/60">
                            <span className="text-xs text-foreground-500">
                              {provider?.trading_name ?? review.pending_provider_name} · {review.review_date}
                            </span>
                            <div className="flex items-center gap-3">
                              {review.provider_id && (
                                <Link to={`/review/${review.review_id}`} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                                  View
                                </Link>
                              )}
                              {/* Editing only makes sense (and is only allowed by the backend) while a review
                                  hasn't been moderated yet — once approved or rejected, it's a closed decision. */}
                              {review.moderation_status === "pending" && (
                                <button
                                  onClick={() => setEditingReview(review)}
                                  className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <Link
                      to="/add-review"
                      className="btn btn-md btn-primary self-start"
                    >
                      <i className="ri-add-line" />
                      Write a new review
                    </Link>
                  </div>
                </div>
              )}

              {/* Saved providers */}
              {tab === "saved" && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground-900 mb-5">Saved Providers</h2>
                  {isLoading ? (
                    <LoadingIndicator />
                  ) : savedProviderIds.length === 0 ? (
                    <div className="p-8 bg-background-100 rounded-2xl text-center">
                      <p className="text-sm text-foreground-500">
                        No saved providers yet. Tap the bookmark icon on a provider's page to save it here.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {savedProviderIds.map((pid) => {
                        const provider = providers.find((p) => p.provider_id === pid);
                        if (!provider) return null;
                        return (
                          <div
                            key={pid}
                            className="flex items-center gap-4 p-4 bg-background-50 border border-background-200/70 rounded-2xl hover:border-primary-200 transition-colors"
                          >
                            <Link to={`/provider/${pid}`} className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-primary-50 text-primary-600 font-bold text-sm">
                                {provider.trading_name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground-900 truncate">{provider.trading_name}</p>
                                <p className="text-xs text-foreground-500 truncate">{provider.location}</p>
                              </div>
                            </Link>
                            <button
                              onClick={() => handleUnsave(pid)}
                              aria-label="Remove from saved providers"
                              className="text-foreground-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                            >
                              <i className="ri-bookmark-fill" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Settings */}
              {tab === "settings" && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground-900 mb-5">Account Settings</h2>
                  <form
                    onSubmit={handleSaveSettings}
                    className="p-6 bg-background-50 border border-background-200/70 rounded-2xl flex flex-col gap-4 max-w-lg"
                  >
                    <div>
                      <label className="block text-sm font-medium text-foreground-700 mb-1.5">Full name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-background-100 border border-background-200/70 rounded-lg text-foreground-900 focus:outline-none focus:border-primary-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-700 mb-1.5">Email address</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-2.5 text-sm bg-background-100 border border-background-200/70 rounded-lg text-foreground-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-foreground-400 mt-1">Email address can't be changed yet.</p>
                    </div>
                    {settingsSaved && <p className="text-xs text-primary-600">Saved.</p>}
                    <button
                      type="submit"
                      disabled={isSavingSettings || displayName.trim() === user.displayName}
                      className="btn btn-md btn-primary self-start"
                    >
                      {isSavingSettings ? "Saving..." : "Save changes"}
                    </button>
                  </form>
                </div>
              )}

              {/* Notifications */}
              {tab === "notifications" && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-heading text-lg font-bold text-foreground-900">Notifications</h2>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    {isLoading && <LoadingIndicator />}
                    {!isLoading && notifications.length === 0 && (
                      <div className="p-8 bg-background-100 rounded-2xl text-center">
                        <p className="text-sm text-foreground-500">No notifications yet.</p>
                      </div>
                    )}
                    {notifications.map((n) => {
                      const { icon, color } = notificationIcons[n.notification_type];
                      return (
                        <button
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`flex items-start gap-4 p-4 border rounded-2xl text-left transition-colors cursor-pointer ${
                            n.is_read
                              ? "bg-background-50 border-background-200/70"
                              : "bg-primary-50/30 border-primary-200/60 hover:bg-primary-50/50"
                          }`}
                        >
                          <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl ${color}`}>
                            <i className={icon} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground-900">{n.title}</p>
                            {n.message && <p className="text-sm text-foreground-600 mt-0.5">{n.message}</p>}
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className="text-xs text-foreground-400 whitespace-nowrap">
                              {formatRelativeTime(n.created_at)}
                            </span>
                            {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {editingReview && (
        <EditReviewModal
          review={editingReview}
          ratingCategories={ratingCategories}
          onClose={() => setEditingReview(null)}
          onSaved={handleReviewUpdated}
        />
      )}
    </div>
  );
}