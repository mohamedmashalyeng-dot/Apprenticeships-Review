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
  const boundedRating = Math.min(Math.max(rating, 0), max);

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      aria-label={`${boundedRating.toFixed(1)} out of ${max}`}
      role="img"
    >
      <div className={`flex items-center gap-0.5 ${sizeClasses[size]}`}>
        {Array.from({ length: max }).map((_, index) => {
          const fill = Math.min(Math.max(boundedRating - index, 0), 1) * 100;
          return (
            <span key={index} className="relative inline-block h-[1em] w-[1em]">
              <i className="ri-star-line absolute inset-0 text-foreground-300" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
                <i className="ri-star-fill text-primary-500" />
              </span>
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-foreground-800 ml-1">
          {boundedRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
