import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

type Choice = { id: string; name: string };
const storageKey = "provider-comparison";
const ComparisonContext = createContext<{
  choices: Choice[];
  toggle: (choice: Choice) => void;
} | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) throw new Error("ComparisonProvider is required");
  return context;
}

function readChoices(): Choice[] {
  try {
    const stored: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(stored)) return [];
    const valid = stored.filter((item): item is Choice => item && typeof item.id === "string" && typeof item.name === "string" && item.id.length > 0);
    return valid.filter((item, index) => valid.findIndex((other) => other.id === item.id) === index).slice(0, 3);
  } catch { return []; }
}

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [choices, setChoices] = useState<Choice[]>(readChoices);
  const { pathname } = useLocation();
  useEffect(() => {
    try { sessionStorage.setItem(storageKey, JSON.stringify(choices)); } catch { /* Selection still works when storage is unavailable. */ }
  }, [choices]);
  function toggle(choice: Choice) {
    setChoices((current) => current.some((item) => item.id === choice.id)
      ? current.filter((item) => item.id !== choice.id)
      : current.length < 3 ? [...current, choice] : current);
  }
  const showBar = choices.length > 0 && (pathname === "/providers" || pathname.startsWith("/provider/") || pathname === "/home" || pathname === "/");
  const query = new URLSearchParams({ providers: choices.map((item) => item.id).join(",") });
  return <ComparisonContext.Provider value={{ choices, toggle }}>
    {children}
    {showBar && <>
      <div className="h-56 sm:h-40" aria-hidden="true" />
      <aside aria-label="Provider comparison shortlist" className="fixed inset-x-0 bottom-0 z-40 border-t border-background-200 bg-background-50 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground-900" role="status">{choices.length}/3 selected <span className="font-normal text-foreground-500">{choices.length === 1 ? "· Choose one more to compare" : "· Ready to compare"}</span></p>
            <ul className="mt-2 flex flex-wrap gap-2">{choices.map((item) => <li key={item.id}>
              <button type="button" onClick={() => toggle(item)} aria-label={`Remove ${item.name} from comparison`} className="flex max-w-[220px] items-center gap-2 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2 text-xs text-primary-700 hover:border-primary-400">
                <span className="truncate">{item.name}</span><span aria-hidden="true">×</span>
              </button>
            </li>)}</ul>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <button type="button" onClick={() => setChoices([])} className="text-sm text-foreground-600 underline underline-offset-4">Clear all</button>
            {choices.length >= 2 ? <Link to={`/compare?${query}`} className="rounded-xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-600">Compare providers →</Link> : <button disabled className="rounded-xl bg-background-200 px-5 py-3 text-sm text-foreground-500">Compare providers</button>}
          </div>
        </div>
      </aside>
    </>}
  </ComparisonContext.Provider>;
}
