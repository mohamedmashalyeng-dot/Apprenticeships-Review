const AVATAR_COLORS = ["#0B5CFF", "#0891B2", "#059669", "#7C3AED", "#EA580C", "#DB2777", "#65A30D", "#B45309"];

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Deterministic per-name color so the same reviewer always gets the same avatar color
// wherever their review appears, instead of it depending on list position.
function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface ReviewerAvatarProps {
  name?: string;
  size?: "sm" | "md";
}

const sizeClasses: Record<NonNullable<ReviewerAvatarProps["size"]>, string> = {
  sm: "w-9 h-9 text-xs",
  md: "w-11 h-11 text-sm",
};

export default function ReviewerAvatar({ name, size = "md" }: ReviewerAvatarProps) {
  const displayName = name?.trim() || "Anonymous";
  return (
    <div
      className={`${sizeClasses[size]} flex-shrink-0 rounded-full overflow-hidden border border-background-200 flex items-center justify-center text-white font-bold`}
      style={{ backgroundColor: colorForName(displayName) }}
    >
      {getInitials(displayName)}
    </div>
  );
}
