import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import StarRating from "@/components/base/StarRating";
import { learnerReviews } from "@/mocks/reviews";
import { providers } from "@/mocks/providers";

type Tab = "reviews" | "saved" | "settings" | "notifications";

const savedProviders = ["kent-business-college", "cambridge-marketing-college", "university-cumbria"];

const notifications = [
  { id: 1, icon: "ri-check-line", color: "bg-primary-50 text-primary-600", title: "Review published", text: "Your review of Kent Business College is now live.", time: "2 days ago" },
  { id: 2, icon: "ri-time-line", color: "bg-secondary-100 text-secondary-600", title: "Review under review", text: "Your review of Cambridge Marketing College is being moderated.", time: "1 week ago" },
  { id: 3, icon: "ri-message-2-line", color: "bg-accent-100 text-accent-700", title: "Provider responded", text: "Kent Business College replied to your review.", time: "2 weeks ago" },
];

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("reviews");

  const myReviews = learnerReviews.slice(0, 3);

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
              SC
            </div>
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground-950">Sophie Carter</h1>
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
                    {myReviews.map((review) => {
                      const provider = providers.find((p) => p.provider_id === review.provider_id);
                      return (
                        <div key={review.review_id} className="p-5 bg-background-50 border border-background-200/70 rounded-2xl">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <StarRating rating={review.rating} size="sm" />
                              <span className="text-sm font-bold text-foreground-900">{review.rating.toFixed(1)}</span>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              review.verification_status === "Verified" ? "bg-primary-50 text-primary-700" : "bg-secondary-50 text-secondary-600"
                            }`}>
                              <i className={`text-xs ${review.verification_status === "Verified" ? "ri-shield-check-line" : "ri-time-line"}`} />
                              {review.verification_status}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-foreground-900 mb-1">{review.review_title}</h3>
                          <p className="text-sm text-foreground-600 line-clamp-2 mb-3">{review.review_text}</p>
                          <div className="flex items-center justify-between pt-3 border-t border-background-200/60">
                            <span className="text-xs text-foreground-500">
                              {provider?.trading_name} · {review.review_date}
                            </span>
                            <div className="flex items-center gap-3">
                              <Link to={`/review/${review.review_id}`} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                                View
                              </Link>
                              <button className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer">
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <Link
                      to="/add-review"
                      className="inline-flex items-center gap-2 self-start px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors whitespace-nowrap"
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
                  <div className="flex flex-col gap-3">
                    {savedProviders.map((pid) => {
                      const provider = providers.find((p) => p.provider_id === pid);
                      if (!provider) return null;
                      return (
                        <Link
                          key={pid}
                          to={`/provider/${pid}`}
                          className="flex items-center gap-4 p-4 bg-background-50 border border-background-200/70 rounded-2xl hover:border-primary-200 transition-colors"
                        >
                          <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-primary-50 text-primary-600 font-bold text-sm">
                            {provider.trading_name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground-900 truncate">{provider.trading_name}</p>
                            <p className="text-xs text-foreground-500 truncate">{provider.location}</p>
                          </div>
                          <span className="text-xs text-primary-600 font-medium flex items-center gap-1 whitespace-nowrap">
                            View <i className="ri-arrow-right-line text-xs" />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Settings */}
              {tab === "settings" && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground-900 mb-5">Account Settings</h2>
                  <div className="p-6 bg-background-50 border border-background-200/70 rounded-2xl flex flex-col gap-4 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-foreground-700 mb-1.5">Full name</label>
                      <input type="text" defaultValue="Sophie Carter" className="w-full px-4 py-2.5 text-sm bg-background-100 border border-background-200/70 rounded-lg text-foreground-900 focus:outline-none focus:border-primary-400 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-700 mb-1.5">Email address</label>
                      <input type="email" defaultValue="sophie.carter@example.com" className="w-full px-4 py-2.5 text-sm bg-background-100 border border-background-200/70 rounded-lg text-foreground-900 focus:outline-none focus:border-primary-400 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-700 mb-1.5">Apprenticeship programme</label>
                      <input type="text" defaultValue="Marketing Executive Level 4" className="w-full px-4 py-2.5 text-sm bg-background-100 border border-background-200/70 rounded-lg text-foreground-900 focus:outline-none focus:border-primary-400 transition-colors" />
                    </div>
                    <button className="self-start px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap">
                      Save changes
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {tab === "notifications" && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground-900 mb-5">Notifications</h2>
                  <div className="flex flex-col gap-3">
                    {notifications.map((n) => (
                      <div key={n.id} className="flex items-start gap-4 p-4 bg-background-50 border border-background-200/70 rounded-2xl">
                        <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl ${n.color}`}>
                          <i className={n.icon} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground-900">{n.title}</p>
                          <p className="text-sm text-foreground-600 mt-0.5">{n.text}</p>
                        </div>
                        <span className="text-xs text-foreground-400 whitespace-nowrap">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}