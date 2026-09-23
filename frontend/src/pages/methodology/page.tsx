import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

const evidenceCategories = [
  {
    icon: "ri-user-voice-line",
    title: "Learner Experience",
    weight: "25%",
    description:
      "We analyse learner-submitted reviews, satisfaction scores from public surveys, and structured feedback. Each review is weighted by recency and verification status. We look for patterns across multiple reviews rather than isolated comments.",
    sources: ["Verified learner reviews", "ESFA learner satisfaction surveys", "Achievement rate data"],
  },
  {
    icon: "ri-building-4-line",
    title: "Employer Satisfaction",
    weight: "20%",
    description:
      "Employer feedback is gathered from verified reviews, public satisfaction data, and employer recognition schemes. Employers judge whether training meets business needs, develops relevant skills, and delivers return on investment.",
    sources: ["Verified employer reviews", "ESFA employer satisfaction surveys", "Employer recognition schemes"],
  },
  {
    icon: "ri-line-chart-line",
    title: "Public Outcomes",
    weight: "25%",
    description:
      "We collect publicly available data on achievement rates, progression, retention, and employment outcomes. Higher achievement rates signal effective training delivery. Retention data shows whether learners stay engaged through to completion.",
    sources: ["ESFA achievement rate data", "Learner destination surveys", "Public progression statistics"],
  },
  {
    icon: "ri-medal-line",
    title: "Ofsted & Quality Evidence",
    weight: "20%",
    description:
      "Ofsted inspection reports provide independent assessments of teaching quality, leadership, safeguarding, and learner outcomes. Outstanding and Good ratings contribute positively. We read the full reports, not just the overall grade.",
    sources: ["Ofsted inspection reports", "Quality assurance agency data", "Matrix Standard accreditation"],
  },
  {
    icon: "ri-chat-check-line",
    title: "Review Confidence",
    weight: "10%",
    description:
      "This category measures the reliability of the review data itself. Providers with more verified reviews, a better spread of recency, and consistent scores across reviewer types earn higher confidence. It is a data quality indicator, not a popularity contest.",
    sources: ["Verification check results", "Review volume & recency", "Score distribution analysis"],
  },
];

const dataSources = [
  {
    name: "Register of Apprenticeship Training Providers (RoATP)",
    url: "https://www.gov.uk/government/publications/register-of-apprenticeship-training-providers",
    description:
      "The official government register of organisations eligible to deliver apprenticeship training. We use this to verify provider identity, UKPRN, delivery status, and the standards each provider is approved to deliver.",
  },
  {
    name: "Find Apprenticeship Training",
    url: "https://www.gov.uk/government/collections/find-apprenticeship-training",
    description:
      "The government's public-facing directory of apprenticeship training options. We cross-reference provider and standard data against this source to ensure accuracy and completeness.",
  },
  {
    name: "Ofsted Inspection Reports",
    url: "https://reports.ofsted.gov.uk/",
    description:
      "Independent inspection reports evaluating apprenticeship provision quality. We extract the most recent overall effectiveness grade, as well as sub-grades for adult learning programmes, apprenticeships, and leadership and management where available.",
  },
  {
    name: "ESFA Public Data",
    url: "https://www.gov.uk/government/statistical-data-sets/fe-data-library-apprenticeships",
    description:
      "Education and Skills Funding Agency statistical releases covering achievement rates, retention, learner demographics, and programme-level outcomes. We use the most recent full academic year data available.",
  },
  {
    name: "Learner & Employer Reviews",
    url: "/reviews",
    description:
      "User-submitted reviews from verified apprentices and employers. Each review undergoes a verification process before it contributes to evidence scores. See our Review Policy for details on how reviews are checked.",
  },
];

const methodologyFaqs = [
  {
    question: "What does the evidence score actually tell me?",
    answer:
      "The evidence score shows how much verified, publicly available data exists for a provider across five categories. It is a data availability indicator, not a quality rating. A provider with a score of 80 does not necessarily deliver better training than one scoring 50. They simply have more publicly accessible data. Use the score alongside reviews, Ofsted reports, provider conversations, and your own research.",
  },
  {
    question: "Why would a provider have a low evidence score?",
    answer:
      "There are several legitimate reasons: the provider may be new and not yet have Ofsted inspection results; they may serve a small number of apprentices so public outcome data is limited; their learners may not have left reviews on our platform; or they may operate in a sector where public data publication is less common. A low score is not automatically a red flag. It is an invitation to ask more questions.",
  },
  {
    question: "How often is the data updated?",
    answer:
      "We refresh our data on different cycles depending on the source. ESFA achievement data is updated annually when the government releases new statistics. Ofsted reports are updated within days of publication. Provider registration status is checked monthly against RoATP. User reviews are processed in real time. Each provider profile shows the last-updated date for transparency.",
  },
  {
    question: "Do all five categories have the same importance?",
    answer:
      "No. The categories are weighted to reflect their reliability and relevance: Learner Experience (25%), Public Outcomes (25%), Employer Satisfaction (20%), Ofsted & Quality Evidence (20%), and Review Confidence (10%). We publish these weights openly so you understand how the overall score is calculated and can adjust your interpretation based on what matters most to you.",
  },
  {
    question: "How do you handle providers with no Ofsted rating?",
    answer:
      "New providers or those that have not yet been inspected will not have an Ofsted rating. In these cases, the Ofsted & Quality Evidence category contributes zero to the overall score, and the remaining four categories carry proportionally more weight. We clearly mark providers as 'Not yet inspected' rather than assigning a default or estimated rating.",
  },
  {
    question: "Can a provider ask for its score to be changed?",
    answer:
      "Providers cannot request a higher score. However, if a provider believes our data is incorrect, such as a missing Ofsted report, incorrect achievement rate, or outdated registration status. They can contact us with evidence and we will verify and correct the record. We are committed to accuracy and welcome corrections from any party.",
  },
  {
    question: "How do you prevent the comparison from being gamed?",
    answer:
      "We use multiple independent data sources so no single source can distort the overall picture. Reviews go through a verification process. We monitor for unusual patterns like sudden spikes in reviews, identical wording across multiple reviews, or reviews concentrated from one IP range. We also separate review data from public outcome data so review volume alone cannot inflate the evidence score dramatically.",
  },
  {
    question: "Does methodology change over time?",
    answer:
      "Yes. We review and improve our methodology periodically as new data sources become available, feedback improves our approach, and the apprenticeship landscape evolves. Any significant changes are announced and documented with an effective date. You can always find the current version on this page.",
  },
];

const limits = [
  {
    icon: "ri-time-line",
    title: "Data Timeliness",
    description:
      "Some public datasets are released annually and may not reflect the most recent months. Achievement data, in particular, can lag by one academic year. We display the data year clearly so you can assess freshness.",
  },
  {
    icon: "ri-file-search-line",
    title: "Data Availability",
    description:
      "Not all providers are subject to the same reporting requirements. Smaller providers, new entrants, and those delivering niche standards may have less public data available through no fault of their own.",
  },
  {
    icon: "ri-user-settings-line",
    title: "Review Subjectivity",
    description:
      "Reviews reflect individual experiences. One learner\u2019s outstanding experience does not guarantee the same for everyone. We encourage reading across multiple reviews and looking for consistent themes.",
  },
  {
    icon: "ri-global-line",
    title: "England Focus",
    description:
      "Our data primarily covers providers delivering apprenticeships in England. Devolved administrations (Scotland, Wales, Northern Ireland) have separate funding, quality assurance, and inspection frameworks not captured here.",
  },
];

export default function Methodology() {
  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/1c1703ae55514886acc5d4c542c7cdd2.png"
            alt="Abstract data visualisation representing evidence-based methodology"
            width={445}
            height={315}
            className="site-image-hero"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background-50/15 backdrop-blur-sm rounded-full border border-background-50/20 mb-8">
              <i className="ri-pie-chart-2-line text-white text-sm" />
              <span className="text-sm text-white font-medium">Our Approach</span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              How we evaluate and compare apprenticeship providers
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              A transparent breakdown of our evidence-based methodology: what we measure, where our data comes from, how scores are calculated, and what the numbers can and cannot tell you.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/compare"
                className="w-full sm:w-auto px-8 py-3.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors whitespace-nowrap"
              >
                See methodology in action
              </Link>
              <a
                href="#evidence-categories"
                className="w-full sm:w-auto px-8 py-3.5 bg-background-50/15 backdrop-blur-sm text-white text-sm font-semibold rounded-full border border-background-50/25 hover:bg-background-50/25 transition-colors whitespace-nowrap"
              >
                How scores work
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== OVERVIEW ===== */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                  Evidence-based, not opinion-based
                </h2>
                <p className="mt-4 text-sm md:text-base text-foreground-600 leading-relaxed">
                  Most provider comparison sites rely on marketing claims, star ratings without context, or a single dimension like Ofsted grade. Our methodology is different: we build a multi-dimensional evidence picture using only publicly verifiable data from government registers, inspection reports, published outcomes, and verified reviews.
                </p>
                <p className="mt-4 text-sm md:text-base text-foreground-600 leading-relaxed">
                  The evidence score is not a quality ranking. It is a data availability indicator, a measure of how much verified, publicly accessible information exists about a provider. A higher score means more data is available for you to evaluate, not that the provider is objectively better. The best decision comes from combining evidence scores with reviews, direct conversations, and your own criteria.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/compare"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full hover:bg-primary-100 transition-colors"
                  >
                    <i className="ri-arrow-left-right-line text-sm" />
                    Compare providers
                  </Link>
                  <Link
                    to="/reviews"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-background-100 text-foreground-700 text-sm font-semibold rounded-full hover:bg-background-200 transition-colors"
                  >
                    <i className="ri-chat-quote-line text-sm" />
                    Read reviews
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <p className="text-3xl font-bold text-primary-600 font-heading">5</p>
                  <p className="mt-1 text-sm text-foreground-600">Evidence categories scored independently</p>
                </div>
                <div className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <p className="text-3xl font-bold text-primary-600 font-heading">5</p>
                  <p className="mt-1 text-sm text-foreground-600">Independent public data sources used</p>
                </div>
                <div className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <p className="text-3xl font-bold text-secondary-600 font-heading">0&ndash;100</p>
                  <p className="mt-1 text-sm text-foreground-600">Score range with transparent weighting</p>
                </div>
                <div className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <p className="text-3xl font-bold text-primary-600 font-heading">Annual</p>
                  <p className="mt-1 text-sm text-foreground-600">Data refresh cycle with continuous review intake</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== EVIDENCE CATEGORIES ===== */}
      <section id="evidence-categories" className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                Five evidence categories
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-xl mx-auto">
                Each category contributes a weighted percentage to the overall evidence score. We publish the weights so you know exactly how the total is calculated.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {evidenceCategories.map((cat, i) => (
                <div
                  key={i}
                  className="p-6 bg-background-50 rounded-xl border border-background-200/70 hover:border-primary-200 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                      <i className={`${cat.icon} text-lg`} />
                    </div>
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {cat.weight}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-semibold text-foreground-900 mb-2">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-foreground-600 leading-relaxed mb-4">{cat.description}</p>
                  <div className="pt-3 border-t border-background-200/60">
                    <p className="text-xs font-semibold text-foreground-500 uppercase tracking-wider mb-1.5">Data Sources</p>
                    <ul className="flex flex-col gap-1">
                      {cat.sources.map((src) => (
                        <li key={src} className="text-xs text-foreground-600 flex items-start gap-1.5">
                          <i className="ri-check-line text-primary-500 flex-shrink-0 mt-0.5" />
                          {src}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== DATA SOURCES TABLE ===== */}
      <section id="data-sources" className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                Our data sources
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-2xl">
                Every data point we use comes from a publicly accessible, verifiable source. We do not scrape proprietary databases, rely on provider self-reporting without evidence, or use paid third-party datasets.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {dataSources.map((ds, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-start gap-4 p-5 bg-background-100 rounded-xl border border-background-200/70"
                >
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <span className="text-xs font-bold">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1.5">
                      <h3 className="font-heading text-sm font-semibold text-foreground-900">{ds.name}</h3>
                      <a
                        href={ds.url}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 whitespace-nowrap"
                      >
                        <i className="ri-external-link-line text-xs" />
                        View source
                      </a>
                    </div>
                    <p className="text-sm text-foreground-600 leading-relaxed">{ds.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== LIMITATIONS ===== */}
      <section className="w-full bg-secondary-50 dark:bg-secondary-950/30">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                Limitations & transparency
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-2xl">
                We believe transparency means being open about what our methodology cannot do as well as what it can. Here are the limitations you should know about.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {limits.map((lim, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 bg-background-50 rounded-xl border border-secondary-200/70"
                >
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-secondary-100 text-secondary-600">
                    <i className={`${lim.icon} text-lg`} />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-foreground-900 mb-1">
                      {lim.title}
                    </h3>
                    <p className="text-sm text-foreground-600 leading-relaxed">{lim.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                Frequently asked methodology questions
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base">
                How we calculate scores, handle edge cases, and keep our data current.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {methodologyFaqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-background-100 rounded-xl border border-background-200/70 overflow-hidden transition-all duration-200"
                >
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                    <span className="text-sm font-medium text-foreground-800 pr-4">{faq.question}</span>
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-background-200 text-foreground-500 group-open:bg-primary-100 group-open:text-primary-600 transition-colors">
                      <i className="ri-add-line text-sm group-open:hidden" />
                      <i className="ri-subtract-line text-sm hidden group-open:block" />
                    </span>
                  </summary>
                  <div className="px-5 pb-4">
                    <p className="text-sm text-foreground-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="w-full bg-primary-600">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl md:text-4xl font-bold text-white mb-4">
              See the methodology in practice
            </h2>
            <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Compare providers side by side with evidence scores, reviews, and public data all in one place. Or browse apprenticeship standards to find the right programme first.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/compare"
                className="w-full sm:w-auto px-8 py-3.5 bg-background-50 text-primary-700 text-sm font-semibold rounded-full hover:bg-background-100 transition-colors whitespace-nowrap"
              >
                Compare Providers
              </Link>
              <Link
                to="/standards"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white text-sm font-semibold rounded-full border border-background-50/30 hover:bg-background-50/10 transition-colors whitespace-nowrap"
              >
                Browse Standards
              </Link>
              <Link
                to="/help"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white text-sm font-semibold rounded-full border border-background-50/30 hover:bg-background-50/10 transition-colors whitespace-nowrap"
              >
                For Learners
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
