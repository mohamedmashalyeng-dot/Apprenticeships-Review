import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCompanies, getPlatformStats } from "@/services/companies.service";
import { getReviewSources } from "@/services/sources.service";
import { getStandards } from "@/services/standards.service";

type StatKey = "marketing" | "projectManagement" | "standards" | "employerReviews" | "apprenticeReviews" | "dataSources";

interface CategoryCard {
  label: string;
  href: string;
  icon: string;
  description: string;
  statKey: StatKey;
  statIcon: string;
  image: string;
  cta: string;
}

const trainingOptions: CategoryCard[] = [
  {
    label: "Marketing",
    href: "/providers?category=sales-marketing",
    icon: "ri-megaphone-line",
    description: "Explore providers offering marketing apprenticeships.",
    statKey: "marketing",
    statIcon: "ri-building-4-line",
    cta: "Explore marketing",
    image:
      "https://readdy.ai/api/search-image?query=Marketing%20team%20brainstorming%20around%20a%20whiteboard%20covered%20with%20colorful%20sticky%20notes%20and%20campaign%20ideas%20in%20a%20bright%20modern%20agency%20office%2C%20natural%20window%20light%2C%20warm%20beige%20and%20amber%20tones%20with%20subtle%20teal%20accents%2C%20genuine%20collaboration%2C%20editorial%20photography%2C%20realistic%20professional%20workspace%20with%20soft%20shadows%20and%20organic%20composition&width=800&height=500&seq=cat-marketing-01&orientation=landscape",
  },
  {
    label: "Project management and project controls",
    href: "/providers?category=leadership-management",
    icon: "ri-clipboard-line",
    description: "Find providers offering apprenticeships in project management and project controls.",
    statKey: "projectManagement",
    statIcon: "ri-building-4-line",
    cta: "Explore project providers",
    image:
      "https://readdy.ai/api/search-image?query=Project%20managers%20reviewing%20a%20kanban%20board%20and%20planning%20charts%20on%20a%20large%20screen%20during%20a%20planning%20meeting%20in%20a%20modern%20office%2C%20focused%20discussion%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20cream%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20realistic%20professional%20atmosphere%20with%20soft%20shadows%20and%20clean%20composition&width=800&height=500&seq=cat-project-mgmt-01&orientation=landscape",
  },
  {
    label: "Degree apprenticeships",
    href: "/standards",
    icon: "ri-graduation-cap-line",
    description: "Explore providers offering degree apprenticeship programmes.",
    statKey: "standards",
    statIcon: "ri-file-list-3-line",
    cta: "Browse programmes",
    image:
      "https://readdy.ai/api/search-image?query=Young%20graduate%20apprentice%20wearing%20a%20cap%20and%20gown%20holding%20a%20diploma%20and%20smiling%20in%20front%20of%20a%20modern%20university%20building%2C%20golden%20hour%20sunlight%2C%20warm%20beige%20and%20amber%20tones%20with%20subtle%20teal%20accents%2C%20editorial%20portrait%20photography%2C%20realistic%20high%20detail%20with%20soft%20depth%20of%20field&width=800&height=500&seq=cat-degree-01&orientation=landscape",
  },
];

const providerInformation: CategoryCard[] = [
  {
    label: "Apprentice reviews",
    href: "/reviews",
    icon: "ri-user-line",
    description: "Read feedback about apprenticeship training.",
    statKey: "apprenticeReviews",
    statIcon: "ri-chat-3-line",
    cta: "Read reviews",
    image:
      "https://readdy.ai/api/search-image?query=Young%20apprentice%20studying%20with%20a%20laptop%20and%20notebooks%20at%20a%20clean%20modern%20desk%20wearing%20headphones%2C%20focused%20and%20engaged%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20amber%20tones%20with%20subtle%20teal%20accents%2C%20editorial%20lifestyle%20photography%2C%20realistic%20high%20detail%20with%20soft%20depth%20of%20field&width=800&height=500&seq=cat-learner-01&orientation=landscape",
  },
  {
    label: "Employer reviews",
    href: "/reviews",
    icon: "ri-building-4-line",
    description: "Read employers' feedback on the providers they work with.",
    statKey: "employerReviews",
    statIcon: "ri-chat-3-line",
    cta: "Read employer feedback",
    image:
      "https://readdy.ai/api/search-image?query=Business%20owner%20and%20manager%20shaking%20hands%20across%20a%20desk%20in%20a%20bright%20modern%20office%20discussing%20a%20training%20partnership%2C%20warm%20natural%20window%20light%2C%20soft%20beige%20and%20cream%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20realistic%20professional%20atmosphere%20with%20soft%20shadows%20and%20clean%20composition&width=800&height=500&seq=cat-employer-01&orientation=landscape",
  },
  {
    label: "Ofsted reports and data sources",
    href: "/data-sources",
    icon: "ri-bar-chart-2-line",
    description: "Understand inspection findings and published provider information.",
    statKey: "dataSources",
    statIcon: "ri-database-2-line",
    cta: "Understand the data",
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
      return `${count.toLocaleString()} ${count === 1 ? "programme" : "programmes"}`;
    case "employerReviews":
    case "apprenticeReviews":
      return `${count.toLocaleString()} ${count === 1 ? "review" : "reviews"}`;
    case "dataSources":
      return `${count.toLocaleString()} data ${count === 1 ? "source" : "sources"}`;
  }
}

function CategoryGrid({ items, counts }: { items: CategoryCard[]; counts: Partial<Record<StatKey, number>> }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
      {items.map((cat, i) => {
        const count = counts[cat.statKey];
        return (
          <Link
            key={cat.label}
            to={cat.href}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-background-200/70 bg-background-50 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(11,92,255,0.12)]"
            style={{
              animationDelay: `${i * 60}ms`,
              animation: "categoryFadeIn 0.5s ease-out both",
            }}
          >
            <div className="relative h-40 overflow-hidden md:h-44">
              <img
                src={cat.image}
                alt=""
                className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-50/95 via-background-50/10 to-transparent" />
              <div className="absolute bottom-3 left-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500 text-white shadow-[0_4px_14px_rgba(11,92,255,0.35)]">
                <i className={`${cat.icon} text-lg`} />
              </div>
            </div>

            <div className="flex flex-1 flex-col p-5 pt-3 md:p-6">
              <h3 className="mb-1.5 font-heading text-lg font-bold text-foreground-900 transition-colors duration-200 group-hover:text-primary-600">
                {cat.label}
              </h3>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-foreground-500">{cat.description}</p>

              <div className="border-t border-background-200/60 pt-4">
                {!!count && (
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50/70 text-primary-500">
                      <i className={`${cat.statIcon} text-xs`} />
                    </div>
                    <span className="text-sm font-semibold text-primary-600">{statLabel(cat.statKey, count)}</span>
                  </div>
                )}
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground-800 group-hover:text-primary-600">
                  {cat.cta}
                  <i className="ri-arrow-right-line text-sm" />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function CategorySection() {
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
        apprenticeReviews: platformStats.status === "fulfilled" ? platformStats.value.learnerReviews : undefined,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-background-50">
      <div className="w-full px-4 py-14 md:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center md:mb-12">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground-900 md:text-3xl">
              Explore training options
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-foreground-500 md:text-lg">
              Start with a subject or apprenticeship route, or browse the full provider directory.
            </p>
          </div>

          <CategoryGrid items={trainingOptions} counts={counts} />

          <div className="mb-8 mt-14 text-center md:mt-16">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground-900 md:text-3xl">
              Reviews and provider information
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-foreground-500 md:text-lg">
              Check review feedback, inspection context and the published information behind each comparison.
            </p>
          </div>

          <CategoryGrid items={providerInformation} counts={counts} />
        </div>
      </div>

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
      `}</style>
    </section>
  );
}
