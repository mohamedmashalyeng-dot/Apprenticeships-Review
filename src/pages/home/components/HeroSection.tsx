import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStandards } from "@/services/standards.service";
import type { Standard } from "@/types/standard";

export default function HeroSection() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [standards, setStandards] = useState<Standard[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getStandards().then((stds) => {
      if (!active) return;
      setStandards(stds);
      setStatus("ready");
    }).catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [attempt]);

  const levels = [...new Set(standards.map((item) => item.level))].sort((a, b) => a - b);
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    navigate(`/providers?${params}`);
  }
  function findMatches(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (level) params.set("level", level);
    navigate(`/providers?${params}`);
  }
  const inputClass = "w-full rounded-xl border border-background-200 bg-background-50 px-4 py-3 text-sm text-foreground-900 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50";

  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <video
          src="https://kentbusinesscollege.com/wp-content/uploads/2026/09/Elegant_abstract_D_animation_.webm"
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-black/65" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-primary-200">Your next step starts here</p>
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Find the right training.<br /><span className="text-primary-200">Choose with confidence.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
              Explore UK apprenticeship providers, read learner experiences and compare your shortlist in one place.
            </p>
            <form onSubmit={search} role="search" className="mt-8">
              <label htmlFor="home-provider-search" className="mb-2 block text-sm font-medium text-white">Already have a provider in mind?</label>
              <div className="flex flex-col gap-2 rounded-2xl border border-background-200 bg-background-50 p-2 shadow-sm sm:flex-row focus-within:ring-2 focus-within:ring-primary-500">
                <input id="home-provider-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Provider name, location or keyword" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-foreground-900 outline-none" />
                <button type="submit" className="rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">Search providers</button>
              </div>
            </form>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
              <Link to="/providers" className="text-primary-200 underline-offset-4 hover:underline">Browse all providers →</Link>
              <Link to="/add-review" className="text-white/85 underline-offset-4 hover:underline">Share your experience →</Link>
            </div>
          </div>
          <div className="rounded-3xl border border-background-200 bg-background-50 p-6 shadow-xl shadow-primary-900/5 md:p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600" aria-hidden="true"><i className="ri-compass-3-line text-2xl" /></div>
            <h2 className="font-heading text-2xl font-bold text-foreground-950">Help me choose</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground-600">Start with your interests. We’ll show providers that match your filters.</p>
            {status === "error" ? <div role="alert" className="mt-6 text-sm text-foreground-700">
              <p>We couldn’t load the options. You can still search by provider name.</p>
              <button type="button" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }} className="mt-3 font-semibold text-primary-600 underline">Try again</button>
            </div> : <form onSubmit={findMatches} className="mt-6 space-y-4" aria-busy={status === "loading"}>
              <div><label htmlFor="finder-level" className="mb-2 block text-sm font-medium text-foreground-800">Which apprenticeship level?</label>
                <select id="finder-level" className={inputClass} value={level} disabled={status === "loading"} onChange={(event) => setLevel(event.target.value)}>
                  <option value="">Not sure yet, show all levels</option>
                  {levels.map((item) => <option key={item} value={item}>Level {item}</option>)}
                </select>
              </div>
              <button type="submit" disabled={status !== "ready"} className="w-full rounded-xl bg-primary-500 px-5 py-3.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50">Find matching providers →</button>
              <p className="text-center text-xs text-foreground-500">No account needed. Refine your search at any time.</p>
            </form>}
          </div>
        </div>
        <ol className="mt-12 grid gap-5 border-t border-white/20 pt-7 sm:grid-cols-3">
          {[['01', 'Explore your options', 'Find providers by level.'], ['02', 'Read real experiences', 'Consider reviews alongside provider information.'], ['03', 'Compare your shortlist', 'See available details side by side.']].map(([number, title, description]) => <li key={number} className="flex gap-3"><span className="text-sm font-semibold text-primary-200">{number}</span><div><p className="text-sm font-semibold text-white">{title}</p><p className="mt-1 text-xs leading-relaxed text-white/75">{description}</p></div></li>)}
        </ol>
      </div>
    </section>
  );
}
