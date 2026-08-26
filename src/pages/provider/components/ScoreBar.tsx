interface ScoreBarProps {
  label: string;
  score: number;
  weight: string;
  maxScore?: number;
}

export default function ScoreBar({ label, score, weight, maxScore = 100 }: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;
  const isNA = score === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <span className="text-sm font-medium text-foreground-800">{label}</span>
          <span className="ml-2 text-xs text-foreground-500">({weight})</span>
        </div>
        <span
          className={`text-sm font-semibold ${
            isNA ? "text-foreground-400" : "text-foreground-900"
          }`}
        >
          {isNA ? "Not Publicly Available" : `${score}/100`}
        </span>
      </div>
      <div className="w-full h-2 bg-background-200 rounded-full overflow-hidden">
        {isNA ? (
          <div className="h-full bg-background-300 rounded-full w-full flex items-center justify-center">
            <span className="text-[8px] text-foreground-400 font-medium">N/A</span>
          </div>
        ) : (
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
}

export function ScoreCircle({ score, label }: { score: number; label?: string }) {
  const isNA = score === 0;
  const circumference = 2 * Math.PI * 36;
  const dashOffset = isNA ? circumference : circumference * (1 - score / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 84 84">
          <circle
            cx="42"
            cy="42"
            r="36"
            fill="none"
            stroke="oklch(var(--background-200))"
            strokeWidth="8"
          />
          {!isNA && (
            <circle
              cx="42"
              cy="42"
              r="36"
              fill="none"
              stroke="oklch(var(--primary-500))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-heading text-xl font-bold ${
              isNA ? "text-foreground-400 text-xs" : "text-foreground-900"
            }`}
          >
            {isNA ? "N/A" : score}
          </span>
        </div>
      </div>
      {label && <span className="mt-2 text-xs text-foreground-500 text-center">{label}</span>}
    </div>
  );
}