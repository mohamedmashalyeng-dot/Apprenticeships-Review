import { useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "@/components/base/StarRating";
import VerifiedBadge from "@/components/base/VerifiedBadge";
import ReviewerAvatar from "@/components/base/ReviewerAvatar";

const COLLAPSE_THRESHOLD = 220;

interface ReviewCardProps {
  rating: number;
  reviewerType: "learner" | "employer";
  // camelCase (direct props)
  title?: string;
  text?: string;
  tags?: string[];
  verificationStatus?: string;
  programmeStudied?: string;
  employerType?: string;
  date?: string;
  reviewerName?: string;
  // snake_case (from mock data spread)
  review_title?: string;
  review_text?: string;
  review_tags?: string[];
  verification_status?: string;
  programme_studied?: string;
  employer_type?: string;
  review_date?: string;
  reviewer_name?: string;
}

export default function ReviewCard(props: ReviewCardProps) {
  const {
    rating,
    reviewerType,
  } = props;
  const [expanded, setExpanded] = useState(false);

  const title = props.title || props.review_title || "";
  const text = props.text || props.review_text || "";
  const tags = props.tags || props.review_tags || [];
  const verificationStatus = props.verificationStatus || props.verification_status || "Pending Verification";
  const programmeStudied = props.programmeStudied || props.programme_studied || undefined;
  const employerType = props.employerType || props.employer_type || undefined;
  const date = props.date || props.review_date || "";
  const reviewerName = (props.reviewerName || props.reviewer_name || "").trim() || "Anonymous";

  return (
    <div className="flex-1 flex flex-col p-5 bg-background-50 border border-background-200/70 rounded-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <ReviewerAvatar name={reviewerName} size="sm" />
          <div>
            <p className="text-sm font-semibold text-foreground-900 leading-tight">{reviewerName}</p>
            <p className="text-xs text-foreground-400">{reviewerType === "learner" ? "Apprentice" : "Employer"}</p>
          </div>
        </div>
        {verificationStatus === "Verified" && <VerifiedBadge />}
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarRating rating={rating} size="sm" showValue />
      </div>

      {/* Programme / Employer info */}
      <div className="mb-2">
        {reviewerType === "learner" && programmeStudied && (
          <p className="text-xs font-medium text-primary-600">{programmeStudied}</p>
        )}
        {reviewerType === "employer" && employerType && (
          <p className="text-xs font-medium text-primary-600">{employerType}</p>
        )}
      </div>

      {/* Title */}
      <h4 className="font-heading text-sm font-semibold text-foreground-900 mb-1.5">{title}</h4>

      {/* Text */}
      <p className={`text-sm text-foreground-600 leading-relaxed ${expanded ? "" : "line-clamp-4"}`}>
        {text}
      </p>
      {text.length > COLLAPSE_THRESHOLD && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-semibold text-primary-600 hover:text-primary-700 cursor-pointer"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-background-100 text-foreground-600 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Date */}
      <p className="mt-auto pt-3 text-xs text-foreground-400">{date}</p>
    </div>
  );
}