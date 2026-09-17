interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "text-xs",
  md: "text-base",
  lg: "text-xl",
};

export default function StarRating({
  rating,
  max = 5,
  size = "md",
  showValue = false,
  className = "",
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = max - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className={`flex items-center gap-0.5 ${sizeClasses[size]}`}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <i key={`full-${i}`} className="ri-star-fill text-primary-500" />
        ))}
        {hasHalf && (
          <span className="relative inline-block w-[1em] h-[1em]">
            <i className="ri-star-line text-white/70 absolute inset-0" />
            <span className="absolute inset-0 overflow-hidden w-1/2">
              <i className="ri-star-fill text-primary-500" />
            </span>
          </span>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <i key={`empty-${i}`} className="ri-star-line text-white/70" />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-foreground-800 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}