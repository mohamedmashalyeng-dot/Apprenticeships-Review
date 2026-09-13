interface VerifiedBadgeProps {
  label?: string;
  size?: "xs" | "sm" | "md";
  icon?: boolean;
  rounded?: "full" | "md";
}

const sizeClasses: Record<NonNullable<VerifiedBadgeProps["size"]>, string> = {
  xs: "px-1.5 py-0.5 text-xs",
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-xs",
};

export default function VerifiedBadge({ label = "Verified", size = "sm", icon = true, rounded = "full" }: VerifiedBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium bg-primary-50 text-primary-700 ${sizeClasses[size]} ${
        rounded === "full" ? "rounded-full" : "rounded-md"
      }`}
    >
      {icon && <i className="text-xs ri-shield-check-line" />}
      {label}
    </span>
  );
}
