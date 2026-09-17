import { useState } from "react";
import { submitReport, type ReportReason } from "@/services/reports.service";

interface ReportReviewModalProps {
  reviewId: string;
  reviewTitle: string;
  onClose: () => void;
}

const reportReasons = [
  { value: "fake", label: "Fake review", icon: "ri-shield-cross-line" },
  { value: "offensive", label: "Offensive content", icon: "ri-error-warning-line" },
  { value: "personal", label: "Personal information", icon: "ri-lock-line" },
  { value: "conflict", label: "Conflict of interest", icon: "ri-shake-hands-line" },
  { value: "spam", label: "Spam", icon: "ri-spam-2-line" },
  { value: "other", label: "Other", icon: "ri-more-line" },
];

export default function ReportReviewModal({ reviewId, reviewTitle, onClose }: ReportReviewModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!selectedReason || isSubmitting) return;
    setIsSubmitting(true);
    submitReport({
      reviewId,
      reason: selectedReason as ReportReason,
      details: details.trim() || undefined,
    })
      .then(() => setSubmitted(true))
      .catch((err) => console.error(err))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-background-50 rounded-2xl shadow-2xl overflow-hidden">
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-primary-50 text-primary-500 mb-4">
              <i className="ri-check-line text-2xl" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground-900 mb-2">Report received</h3>
            <p className="text-sm text-foreground-600 leading-relaxed">
              Thank you for flagging this review. Our moderation team will review your report within 3 working days.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-background-200/60">
              <h3 className="font-heading text-base font-semibold text-foreground-900">Report review</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-foreground-400 hover:bg-background-100 hover:text-foreground-700 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <i className="ri-close-line" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-xs text-foreground-500 mb-4">
                Reviewing: <span className="font-medium text-foreground-700">"{reviewTitle}"</span>
              </p>

              <p className="text-sm font-semibold text-foreground-900 mb-3">Why are you reporting this review?</p>
              <div className="flex flex-col gap-2 mb-5">
                {reportReasons.map((reason) => (
                  <button
                    key={reason.value}
                    onClick={() => setSelectedReason(reason.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      selectedReason === reason.value
                        ? "border-primary-400 bg-primary-50/50"
                        : "border-background-200/70 bg-background-50 hover:border-background-300"
                    }`}
                  >
                    <i className={`${reason.icon} text-base ${selectedReason === reason.value ? "text-primary-600" : "text-foreground-400"}`} />
                    <span className="text-sm font-medium text-foreground-800">{reason.label}</span>
                    {selectedReason === reason.value && (
                      <i className="ri-check-line text-primary-600 ml-auto" />
                    )}
                  </button>
                ))}
              </div>

              <label className="block text-sm font-semibold text-foreground-900 mb-2">
                Additional details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Help us understand the issue..."
                className="w-full px-4 py-3 text-sm bg-background-100 border border-background-200/70 rounded-lg text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors resize-none"
              />
              <p className="text-xs text-foreground-400 mt-1">{details.length}/500</p>

              <button
                onClick={handleSubmit}
                disabled={!selectedReason || isSubmitting}
                className="mt-5 w-full py-3 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
              >
                {isSubmitting ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}