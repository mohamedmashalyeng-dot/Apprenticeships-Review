import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCompanies, getPlatformStats } from "@/services/companies.service";
import { getStandards } from "@/services/standards.service";
import { getReviewSources } from "@/services/sources.service";

type StatKey = "marketing" | "projectManagement" | "standards" | "employerReviews" | "learnerReviews" | "dataSources";

const categories: {
  label: string;
  href: string;
  icon: string;
  description: string;
  statKey: StatKey;
  statIcon: string;
  brandColor: string;
  image: string;
}[] = [
  {
    label: "Marketing Providers",
    href: "/compare",
    icon: "ri-megaphone-line",
    description: "Compare top marketing apprenticeship providers",
    statKey: "marketing",
    statIcon: "ri-building-4-line",
    brandColor: "#0B5CFF",
    image:
      "https://readdy.ai/api/search-image?query=Marketing%20team%20brainstorming%20around%20a%20whiteboard%20covered%20with%20colorful%20sticky%20notes%20and%20campaign%20ideas%20in%20a%20bright%20modern%20agency%20office%2C%20natural%20window%20light%2C%20warm%20beige%20and%20amber%20tones%20with%20subtle%20teal%20accents%2C%20genuine%20collaboration%2C%20editorial%20photography%2C%20realistic%20professional%20workspace%20with%20soft%20shadows%20and%20organic%20composition&width=800&height=500&seq=cat-marketing-01&orientation=landscape",
  },
  {
    label: "Project Management",
    href: "/compare",
    icon: "ri-clipboard-line",
    description: "Find project management training providers",
    statKey: "projectManagement",
    statIcon: "ri-building-4-line",
    brandColor: "#0891B2",
    image:
      "https://readdy.ai/api/search-image?query=Project%20managers%20reviewing%20a%20kanban%20board%20and%20planning%20charts%20on%20a%20large%20screen%20during%20a%20planning%20meeting%20in%20a%20modern%20office%2C%20focused%20discussion%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20cream%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20realistic%20professional%20atmosphere%20with%20soft%20shadows%20and%20clean%20composition&width=800&height=500&seq=cat-project-mgmt-01&orientation=landscape",
  },
  {
    label: "Degree Apprenticeships",
    href: "/standards",
    icon: "ri-graduation-cap-line",
    description: "Explore degree-level apprenticeship programmes",
    statKey: "standards",
    statIcon: "ri-file-list-3-line",
    brandColor: "#7C3AED",
    image:
      "https://readdy.ai/api/search-image?query=Young%20graduate%20apprentice%20wearing%20a%20cap%20and%20gown%20holding%20a%20diploma%20and%20smiling%20in%20front%20of%20a%20modern%20university%20building%2C%20golden%20hour%20sunlight%2C%20warm%20beige%20and%20amber%20tones%20with%20subtle%20teal%20accents%2C%20editorial%20portrait%20photography%2C%20realistic%20high%20detail%20with%20soft%20depth%20of%20field&width=800&height=500&seq=cat-degree-01&orientation=landscape",
  },
  {
    label: "Employer Reviews",
    href: "/reviews",
    icon: "ri-building-4-line",
    description: "Real employer feedback on training providers",
    statKey: "employerReviews",
    statIcon: "ri-chat-3-line",
    brandColor: "#059669",
    image:
      "https://readdy.ai/api/search-image?query=Business%20owner%20and%20manager%20shaking%20hands%20across%20a%20desk%20in%20a%20bright%20modern%20office%20discussing%20a%20training%20partnership%2C%20warm%20natural%20window%20light%2C%20soft%20beige%20and%20cream%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20realistic%20professional%20atmosphere%20with%20soft%20shadows%20and%20clean%20composition&width=800&height=500&seq=cat-employer-01&orientation=landscape",
  },
  {
    label: "Learner Reviews",
    href: "/reviews",
    icon: "ri-user-line",
    description: "Honest reviews from current and past apprentices",
    statKey: "learnerReviews",
    statIcon: "ri-chat-3-line",
    brandColor: "#EA580C",
    image:
      "https://readdy.ai/api/search-image?query=Young%20apprentice%20studying%20with%20a%20laptop%20and%20notebooks%20at%20a%20clean%20modern%20desk%20wearing%20headphones%2C%20focused%20and%20engaged%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20amber%20tones%20with%20subtle%20teal%20accents%2C%20editorial%20lifestyle%20photography%2C%20realistic%20high%20detail%20with%20soft%20depth%20of%20field&width=800&height=500&seq=cat-learner-01&orientation=landscape",
  },
  {
    label: "Ofsted & Data Sources",
    href: "/data-sources",
    icon: "ri-bar-chart-2-line",
    description: "Official ratings and public data explained",
    statKey: "dataSources",
    statIcon: "ri-database-2-line",
    brandColor: "#475569",
    image:
      "https://readdy.ai/api/search-image?query=Analyst%20viewing%20official%20performance%20charts%20and%20data%20dashboards%20on%20dual%20monitors%20in%20a%20modern%20office%2C%20clean%20minimal%20workspace%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20cream%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20realistic%20professional%20atmosphere%20with%20soft%20shadows%20and%20clean%20composition&width=800&height=500&seq=cat-data-01&orientation=landscape",
  },
];

function statLabel(key: StatKey, count: number): string {
  switch (key) {
    case "marketing":
    case "projectManagement":
      return `${count.toLocaleString()} ${count === 1 ? "provider" : "providers"}`;
    case "standards":
      return `${count.toLocaleString()} ${count === 1 ? "standard" : "standards"}`;
    case "employerReviews":
    case "learnerReviews":
      return `${count.toLocaleString()} ${count === 1 ? "review" : "reviews"}`;
    case "dataSources":
      return `${count.toLocaleString()} data ${count === 1 ? "source" : "sources"}`;
  }
}

export default function CategorySection() {
  // Real counts pulled from the API — a category's stat line is only rendered once its count
  // has loaded and is greater than zero, so we never show a number with nothing behind it.
  const [counts, setCounts] = useState<Partial<Record<StatKey, number>>>({});

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getCompanies({ categoryId: "sales-marketing" }),
      getCompanies({ categoryId: "leadership-management" }),
      getStandards(),
      getReviewSources(),
      getPlatformStats(),
    ]).then(([marketing, projectManagement, standards, sources, platformStats]) => {
      if (!active) return;
      setCounts({
        marketing: marketing.status === "fulfilled" ? marketing.value.length : undefined,
        projectManagement: projectManagement.status === "fulfilled" ? projectManagement.value.length : undefined,
        standards: standards.status === "fulfilled" ? standards.value.length : undefined,
        dataSources: sources.status === "fulfilled" ? sources.value.length : undefined,
        employerReviews: platformStats.status === "fulfilled" ? platformStats.value.employerReviews : undefined,
        learnerReviews: platformStats.status === "fulfilled" ? platformStats.value.learnerReviews : undefined,
      });
    });
    return () => { active = false; };
  }, []);

  return (
    <section className="relative w-full bg-background-50 overflow-hidden">
      <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-10 md:mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-900 tracking-tight">
              What are you looking for?
            </h2>
            <p className="mt-3 text-base md:text-lg text-foreground-500 max-w-lg mx-auto leading-relaxed">
              Browse by category to find the right apprenticeship providers, reviews, and data for your needs.
            </p>
          </div>

          {/* Category grid — 3 cols on desktop, 2 on tablet, 1 on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {categories.map((cat, i) => {
              const count = counts[cat.statKey];
              return (
              <Link
                key={cat.label}
                to={cat.href}
                className="group relative flex flex-col bg-background-50 border border-background-200/70 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(11,92,255,0.12)] transition-all duration-300 ease-out"
                style={{
                  "--brand": "#0B5CFF",
                  animationDelay: `${i * 60}ms`,
                  animation: "categoryFadeIn 0.5s ease-out both",
                } as React.CSSProperties}
              >
                {/* Hover border beam */}
                <span
                  aria-hidden="true"
                  className="category-border-beam pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />

                {/* Image */}
                <div className="relative h-40 md:h-44 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={`${cat.label} apprenticeship category`}
                    className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {/* Soft bottom fade into card */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background-50/90 via-background-50/10 to-transparent" />
                  {/* Floating icon badge */}
                  <div className="absolute bottom-3 left-4 w-11 h-11 flex items-center justify-center rounded-xl bg-primary-500 text-white shadow-[0_4px_14px_rgba(11,92,255,0.35)]">
                    <i className={`${cat.icon} text-lg`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5 md:p-6 pt-3">
                  {/* Title */}
                  <h3 className="font-heading text-lg font-bold text-foreground-900 mb-1.5 group-hover:text-primary-600 transition-colors duration-200">
                    {cat.label}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-foreground-500 leading-relaxed mb-4 flex-1">
                    {cat.description}
                  </p>

                  {/* Stat line — only shown once the real count has loaded and is non-zero */}
                  {!!count && (
                    <div className="flex items-center gap-2 pt-4 border-t border-background-200/60">
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-50/70 text-primary-500">
                        <i className={`${cat.statIcon} text-xs`} />
                      </div>
                      <span className="text-sm font-semibold text-primary-600">
                        {statLabel(cat.statKey, count)}
                      </span>
                      <div className="ml-auto w-7 h-7 flex items-center justify-center rounded-full bg-background-100 text-foreground-300 group-hover:bg-primary-50 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all duration-300 opacity-0 group-hover:opacity-100">
                        <i className="ri-arrow-right-line text-sm" />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keyframe for staggered entrance */}
      <style>{`
        @keyframes categoryFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @property --beam-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        .category-border-beam {
          --border-width: 1.5px;
          padding: var(--border-width);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
        }

        .category-border-beam::before {
          content: "";
          position: absolute;
          inset: -100%;
          background: conic-gradient(
            from var(--beam-angle),
            transparent 0deg,
            #0B5CFF 60deg,
            transparent 120deg
          );
          animation: beam-rotate 2.5s linear infinite;
          animation-play-state: paused;
        }

        .group:hover .category-border-beam::before {
          animation-play-state: running;
        }

        @keyframes beam-rotate {
          to {
            --beam-angle: 360deg;
          }
        }
      `}</style>
    </section>
  );
}