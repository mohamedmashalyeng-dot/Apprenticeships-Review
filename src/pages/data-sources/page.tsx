import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

const dataSourceDetails = [
  {
    name: "Register of Apprenticeship Training Providers (RoATP)",
    icon: "ri-government-line",
    url: "https://www.gov.uk/government/publications/register-of-apprenticeship-training-providers",
    frequency: "Monthly",
    whatWeGet:
      "Provider registration status, UKPRN number, legal name, trading name, registered address, delivery status (active/inactive), standards each provider is approved to deliver, and any regulatory actions or removal from the register.",
    howWeUse:
      "This is our primary source for verifying provider identity and legitimacy. Any provider listed on our platform must have an active entry on RoATP. We cross-reference provider names, UKPRNs, and standard delivery approvals to ensure our directory is accurate. Providers not on RoATP are flagged as unverified.",
    limitations:
      "RoATP does not provide quality ratings, learner outcomes, or satisfaction data. Being on the register confirms eligibility to deliver apprenticeships but says nothing about training quality. Some providers may have their registration under review — we check for status changes monthly.",
  },
  {
    name: "Find Apprenticeship Training",
    icon: "ri-search-eye-line",
    url: "https://www.gov.uk/government/collections/find-apprenticeship-training",
    frequency: "Monthly",
    whatWeGet:
      "Public-facing provider directory including delivery locations, contact details, website links, and the apprenticeship standards each provider advertises as available. Also includes training delivery models (day release, block release, online, workplace).",
    howWeUse:
      "We use this to supplement RoATP data with delivery location and contact information. It also helps us identify providers that are registered but not actively advertising training — these providers are marked accordingly on our platform so users can make informed choices.",
    limitations:
      "Provider listings on Find Apprenticeship Training are self-maintained and may be incomplete or out of date. Some providers deliver standards that do not appear on their listing. We treat this as a supplementary source, not the authoritative record.",
  },
  {
    name: "Ofsted Inspection Reports",
    icon: "ri-file-search-line",
    url: "https://reports.ofsted.gov.uk/",
    frequency: "Within days of publication",
    whatWeGet:
      "Overall effectiveness grade (Outstanding, Good, Requires Improvement, Inadequate), sub-grades for apprenticeship provision, adult learning programmes, and leadership and management. Full inspection report text including strengths, areas for improvement, and safeguarding assessment.",
    howWeUse:
      "We extract the most recent inspection outcome for each provider and display the overall effectiveness grade prominently on provider profiles. We also read report details to surface noteworthy findings — for example, if a provider excels in safeguarding but needs to improve teaching quality, we note that nuance rather than reducing everything to a single grade.",
    limitations:
      "Ofsted does not inspect every provider annually. Newer providers may not yet have a rating. Inspection frequency depends on previous grade — Outstanding providers may go several years between inspections. An Ofsted grade reflects a snapshot in time, not continuous monitoring. Sub-grades are not always published separately for apprenticeship provision.",
  },
  {
    name: "ESFA Public Data",
    icon: "ri-bar-chart-grouped-line",
    url: "https://www.gov.uk/government/statistical-data-sets/fe-data-library-apprenticeships",
    frequency: "Annually (upon government release)",
    whatWeGet:
      "Achievement rates by provider, standard, and delivery model. Retention rates, learner demographics (age, gender, ethnicity, learning difficulty), and programme-level outcomes. Data is typically released one academic year in arrears.",
    howWeUse:
      "Achievement rates feed into the Public Outcomes category of our evidence score. We display achievement data with clear year labels so users understand how recent the data is. We also note where data has been suppressed due to small cohort sizes — this is common for niche standards or small providers.",
    limitations:
      "Data lags by at least one academic year. Achievement rates can be influenced by factors outside provider control (learner circumstances, employer engagement, economic conditions). Suppressed data for small cohorts creates gaps. ESFA methodology changes between years can affect year-on-year comparability.",
  },
  {
    name: "Learner & Employer Reviews",
    icon: "ri-chat-quote-line",
    url: "/reviews",
    frequency: "Real-time (continuous)",
    whatWeGet:
      "Star ratings (1-5), review text, reviewer type (learner or employer), apprenticeship standard completed, provider name, completion status, recommendation status, and review date. Reviews go through our verification process before contributing to scores.",
    howWeUse:
      "Reviews contribute to the Learner Experience and Employer Satisfaction categories of our evidence score. We weight reviews by recency and verification status. Patterns across multiple reviews are more significant than individual comments. Review confidence (volume, recency spread, consistency) feeds into the Review Confidence category.",
    limitations:
      "Reviews are subjective by nature and reflect individual experiences. Providers with few reviews have less reliable aggregated ratings. Self-selection bias means extremely satisfied or dissatisfied individuals may be more likely to leave reviews. We mitigate these limitations through verification, pattern analysis, and transparency about sample sizes.",
  },
];

const refreshSchedule = [
  { source: "RoATP Registration Status", cycle: "Monthly", notes: "Checked on the first week of each month. Any status changes (new registrations, removals, suspensions) are reflected within 5 working days." },
  { source: "Find Apprenticeship Training", cycle: "Monthly", notes: "Synchronised with RoATP checks. Delivery locations and contact details updated if changes are detected." },
  { source: "Ofsted Inspection Reports", cycle: "Within 5 days", notes: "New reports are integrated within 5 working days of publication on the Ofsted website. Provider profiles show the inspection date clearly." },
  { source: "ESFA Achievement Data", cycle: "Annually", notes: "Updated within 4 weeks of the annual government statistical release. Previous year data is archived and remains accessible for historical comparison." },
  { source: "Learner & Employer Reviews", cycle: "Real-time", notes: "New reviews appear after passing verification and moderation. Scores are recalculated daily to incorporate the latest verified review data." },
];

const dataSourceFaqs = [
  {
    question: "Why do you only use public data sources?",
    answer:
      "Using only publicly verifiable data sources means every data point on our platform can be independently checked. You do not have to trust us — you can go to RoATP, Ofsted, or ESFA directly and verify what we display. This transparency is fundamental to our methodology and distinguishes us from comparison sites that rely on proprietary or self-reported data.",
  },
  {
    question: "What if a data source has incorrect information?",
    answer:
      "We cross-reference multiple sources to catch discrepancies. If we find conflicting information, we default to the most authoritative source (RoATP for registration status, Ofsted for inspection grades, ESFA for outcomes). If a provider or user reports an error, we investigate and correct it if the evidence supports the claim. Contact us through our contact page to report data errors.",
  },
  {
    question: "How do you handle data gaps?",
    answer:
      "Data gaps are common and honest. A new provider will not have achievement data. A small provider may have suppressed ESFA statistics. A provider not yet inspected will have no Ofsted rating. We mark gaps clearly rather than concealing them, and our evidence score methodology adjusts weights proportionally when categories have no data.",
  },
  {
    question: "Do you scrape data or use APIs?",
    answer:
      "We access data through official government publications and registers where possible. Where structured downloads or APIs are available, we use them. Where manual extraction is necessary, we document the extraction date and process. We never use unauthorised scraping, paid third-party datasets, or proprietary provider information without permission.",
  },
  {
    question: "How do you verify provider identity?",
    answer:
      "We match against the UKPRN (UK Provider Reference Number) in the RoATP register. The UKPRN is a unique identifier assigned by the UK Register of Learning Providers. We display UKPRNs on provider profiles so users can independently verify registration status. Providers without a verifiable UKPRN are marked as unverified.",
  },
  {
    question: "Why is some ESFA data suppressed?",
    answer:
      "ESFA suppresses (withholds) achievement and outcome data for cohorts smaller than a certain threshold to protect individual learner privacy. This is standard government statistical practice. We display a note where data has been suppressed rather than estimating or filling gaps. Suppressed data does not negatively affect a provider's evidence score — the category weight is simply redistributed.",
  },
];

export default function DataSources() {
  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://readdy.ai/api/search-image?query=Professionals%20collaborating%20over%20a%20wall%20of%20data%20charts%20and%20analytics%20on%20large%20screens%20in%20a%20modern%20workspace%2C%20pointing%20and%20discussing%20insights%20together%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20amber%20tones%20with%20teal%20accents%2C%20editorial%20photography%2C%20high%20detail%2C%20realistic%20analytical%20teamwork%20atmosphere&width=1600&height=650&seq=datasources-hero-01&orientation=landscape&nocache=true"
            alt="Abstract composition representing interconnected data sources"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background-50/15 backdrop-blur-sm rounded-full border border-background-50/20 mb-8">
              <i className="ri-database-2-line text-white text-sm" />
              <span className="text-sm text-white font-medium">Public Data Only</span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Data Sources
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              Every piece of provider information on ApprenticeshipsReviews comes from a publicly verifiable source. Here is exactly where our data comes from, how we use it, what it can tell you, and what it cannot.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/methodology"
                className="w-full sm:w-auto px-8 py-3.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors whitespace-nowrap"
              >
                See how data is scored
              </Link>
              <a
                href="#sources"
                className="w-full sm:w-auto px-8 py-3.5 bg-background-50/15 backdrop-blur-sm text-white text-sm font-semibold rounded-lg border border-background-50/25 hover:bg-background-50/25 transition-colors whitespace-nowrap"
              >
                View all sources
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
                  Five independent public data sources
                </h2>
                <p className="mt-4 text-sm md:text-base text-foreground-600 leading-relaxed">
                  We do not scrape proprietary databases, rely on provider self-reporting without verification, or use paid third-party datasets. Every data source we use is publicly accessible, independently verifiable, and maintained by UK government bodies or contributed by verified users.
                </p>
                <p className="mt-4 text-sm md:text-base text-foreground-600 leading-relaxed">
                  This page describes each source in detail: what data we extract, how we use it in our evidence scoring, how frequently we update it, and the limitations you should be aware of when interpreting the data. Transparency about our sources is core to our mission.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/methodology"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full hover:bg-primary-100 transition-colors"
                  >
                    <i className="ri-pie-chart-2-line text-sm" />
                    Methodology
                  </Link>
                  <Link
                    to="/compare"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-background-100 text-foreground-700 text-sm font-semibold rounded-lg hover:bg-background-200 transition-colors"
                  >
                    <i className="ri-arrow-left-right-line text-sm" />
                    Compare providers
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <p className="text-3xl font-bold text-primary-600 font-heading">5</p>
                  <p className="mt-1 text-sm text-foreground-600">Independent public data sources</p>
                </div>
                <div className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <p className="text-3xl font-bold text-primary-600 font-heading">4</p>
                  <p className="mt-1 text-sm text-foreground-600">UK government sources</p>
                </div>
                <div className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <p className="text-3xl font-bold text-secondary-600 font-heading">Real-time</p>
                  <p className="mt-1 text-sm text-foreground-600">User reviews updated continuously</p>
                </div>
                <div className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <p className="text-3xl font-bold text-primary-600 font-heading">100%</p>
                  <p className="mt-1 text-sm text-foreground-600">Publicly verifiable — no proprietary data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DETAILED SOURCES ===== */}
      <section id="sources" className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                Detailed source breakdown
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-2xl">
                Each source below includes exactly what data we extract, how we use it, refresh frequency, and known limitations.
              </p>
            </div>
            <div className="flex flex-col gap-8">
              {dataSourceDetails.map((ds, i) => (
                <div
                  key={i}
                  className="p-6 md:p-8 bg-background-50 rounded-xl border border-background-200/70"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Left: header */}
                    <div className="lg:w-64 flex-shrink-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                          <i className={`${ds.icon} text-xl`} />
                        </div>
                        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                          Source {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-foreground-900 mb-2">{ds.name}</h3>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs text-foreground-500">
                          <i className="ri-refresh-line text-xs" />
                          <span>Updated: {ds.frequency}</span>
                        </div>
                        <a
                          href={ds.url}
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 whitespace-nowrap"
                        >
                          <i className="ri-external-link-line text-xs" />
                          View official source
                        </a>
                      </div>
                    </div>

                    {/* Right: content */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <h4 className="text-xs font-semibold text-foreground-500 uppercase tracking-wider mb-2">What we extract</h4>
                        <p className="text-sm text-foreground-700 leading-relaxed">{ds.whatWeGet}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-foreground-500 uppercase tracking-wider mb-2">How we use it</h4>
                        <p className="text-sm text-foreground-700 leading-relaxed">{ds.howWeUse}</p>
                      </div>
                      <div className="md:col-span-2 pt-4 border-t border-background-200/60">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-md bg-amber-50 text-amber-600 mt-0.5">
                            <i className="ri-information-line text-sm" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-foreground-500 uppercase tracking-wider mb-1">Limitations to be aware of</h4>
                            <p className="text-sm text-foreground-600 leading-relaxed">{ds.limitations}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== REFRESH SCHEDULE ===== */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                Data refresh schedule
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-2xl">
                Different sources update on different cycles. Here is when each dataset is refreshed on our platform.
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-background-200/70">
              <div className="hidden md:grid grid-cols-3 gap-4 px-6 py-4 bg-background-100 border-b border-background-200/70">
                <span className="text-xs font-semibold text-foreground-500 uppercase tracking-wider">Data Source</span>
                <span className="text-xs font-semibold text-foreground-500 uppercase tracking-wider">Update Cycle</span>
                <span className="text-xs font-semibold text-foreground-500 uppercase tracking-wider">Notes</span>
              </div>
              {refreshSchedule.map((rs, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 px-6 py-4 ${
                    i < refreshSchedule.length - 1 ? "border-b border-background-200/50" : ""
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold text-foreground-500 uppercase tracking-wider md:hidden mb-0.5 block">Source</span>
                    <p className="text-sm font-medium text-foreground-800">{rs.source}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground-500 uppercase tracking-wider md:hidden mb-0.5 block">Cycle</span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-foreground-700">
                      <i className="ri-refresh-line text-xs text-foreground-400" />
                      {rs.cycle}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground-500 uppercase tracking-wider md:hidden mb-0.5 block">Notes</span>
                    <p className="text-sm text-foreground-600 leading-relaxed">{rs.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                Frequently asked data questions
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base">
                How we source, verify, and maintain the accuracy of our data.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {dataSourceFaqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-background-50 rounded-xl border border-background-200/70 overflow-hidden transition-all duration-200"
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
              See the data in action
            </h2>
            <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Compare providers side by side using real data from these sources. Or learn how we turn source data into evidence scores on our Methodology page.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/compare"
                className="w-full sm:w-auto px-8 py-3.5 bg-background-50 text-primary-700 text-sm font-semibold rounded-lg hover:bg-background-100 transition-colors whitespace-nowrap"
              >
                Compare Providers
              </Link>
              <Link
                to="/methodology"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white text-sm font-semibold rounded-lg border border-background-50/30 hover:bg-background-50/10 transition-colors whitespace-nowrap"
              >
                Methodology
              </Link>
              <Link
                to="/help"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white text-sm font-semibold rounded-lg border border-background-50/30 hover:bg-background-50/10 transition-colors whitespace-nowrap"
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