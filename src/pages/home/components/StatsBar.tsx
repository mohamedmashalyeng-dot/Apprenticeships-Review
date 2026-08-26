import { useEffect, useRef, useState } from "react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: string;
}

const stats: Stat[] = [
  { value: 1070, suffix: "+", label: "Verified reviews", icon: "ri-chat-3-line" },
  { value: 40, suffix: "+", label: "Providers reviewed", icon: "ri-building-4-line" },
  { value: 6, suffix: "", label: "Apprenticeship standards", icon: "ri-graduation-cap-line" },
  { value: 5, suffix: "", label: "Data sources", icon: "ri-database-2-line" },
];

function useCountUp(target: number, start: boolean, duration = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);

  return value;
}

function StatItem({ stat, start }: { stat: Stat; start: boolean }) {
  const value = useCountUp(stat.value, start);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-background-50/10 text-accent-400 mb-4">
        <i className={`${stat.icon} text-xl`} />
      </div>
      <div className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight">
        {value.toLocaleString()}
        <span className="text-accent-400">{stat.suffix}</span>
      </div>
      <p className="mt-1.5 text-sm text-white/85">{stat.label}</p>
    </div>
  );
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative w-full bg-black overflow-hidden">
      {/* Decorative glow orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-20 -left-20 w-[400px] h-[300px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, oklch(var(--primary-500) / 0.18) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute -bottom-24 -right-20 w-[420px] h-[320px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, oklch(var(--accent-500) / 0.16) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-14 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {stats.map((stat) => (
              <StatItem key={stat.label} stat={stat} start={inView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}