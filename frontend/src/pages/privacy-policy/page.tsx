import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

const whatWeCollect = [
  {
    icon: "ri-user-smile-line",
    title: "Identity & profile data",
    items: [
      "Full name (displayed only with your consent)",
      "Email address",
      "Learner or employer status",
      "Apprenticeship standard and provider affiliation",
    ],
  },
  {
    icon: "ri-chat-quote-line",
    title: "Review content you submit",
    items: [
      "Review text, rating, and recommendation status",
      "Verification evidence (certificates, enrolment confirmations)",
      "Review metadata: date, standard, provider, reviewer type",
    ],
  },
  {
    icon: "ri-mail-send-line",
    title: "Contact form submissions",
    items: [
      "Name, email, subject, and message content",
      "Submission timestamp and status",
      "IP address (used only for spam detection)",
    ],
  },
  {
    icon: "ri-computer-line",
    title: "Automatically collected data",
    items: [
      "Browser type, device type, and operating system",
      "Pages visited and time spent (anonymised analytics)",
      "Referring website or search term (where available)",
      "Approximate geographic region (city-level, not exact)",
    ],
  },
];

const principles = [
  {
    icon: "ri-eye-off-line",
    title: "We do not sell your data",
    description: "ApprenticeshipsReviews does not sell, rent, or trade personal data to third parties for marketing, advertising, or any other commercial purpose. Your data is not a product.",
  },
  {
    icon: "ri-focus-3-line",
    title: "We collect only what we need",
    description: "Every piece of data we ask for serves a specific purpose: verifying your identity, publishing your review, responding to your enquiry, or improving our service. If we do not need it, we do not ask for it.",
  },
  {
    icon: "ri-delete-back-2-line",
    title: "You control your data",
    description: "You can request a copy of your data, ask us to correct inaccuracies, or request deletion at any time. See the 'Your Rights' section below for how to exercise these rights.",
  },
  {
    icon: "ri-shield-flash-line",
    title: "We protect your data",
    description: "We use industry-standard security measures including encryption in transit, access controls, and regular security reviews. Personal data is stored securely and access is restricted to authorised personnel only.",
  },
];

const lawfulBasis = [
  {
    badgeLabel: "Consent",
    badgeClass: "bg-green-50 text-green-700 border-green-200/70",
    title: "With your consent",
    items: [
      "Publishing your review on the provider profile page",
      "Sending you email updates about your review status",
      "Optional analytics cookies (you can decline)",
    ],
  },
  {
    badgeLabel: "Legitimate Interest",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200/70",
    title: "Legitimate interest",
    items: [
      "Maintaining site security and preventing fraud",
      "Aggregated, anonymised analytics to improve our service",
      "Responding to your enquiries via our contact form",
    ],
  },
  {
    badgeLabel: "Legal Obligation",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/70",
    title: "Legal obligation",
    items: [
      "Complying with lawful requests from UK authorities",
      "Retaining records required by applicable law",
      "Responding to data subject access requests under UK GDPR",
    ],
  },
];

const userRights = [
  { name: "Right of access", description: "You can request a copy of the personal data we hold about you, free of charge. We will respond within 30 days." },
  { name: "Right to rectification", description: "If any data we hold about you is inaccurate or incomplete, you can ask us to correct it. We will do so promptly." },
  { name: "Right to erasure", description: "You can ask us to delete your personal data. We will comply unless we have a legal obligation to retain it (for example, fraud prevention)." },
  { name: "Right to restrict processing", description: "You can ask us to limit how we use your data while a concern is investigated, for example, if you contest the accuracy of your data." },
  { name: "Right to data portability", description: "You can request your data in a structured, machine-readable format to transfer it to another service." },
  { name: "Right to object", description: "You can object to our processing of your data for direct marketing or where we process it on the basis of legitimate interest." },
  { name: "Rights related to automated decisions", description: "We do not use automated decision-making or profiling that produces legal effects. If this changes, we will update this policy and inform you." },
];

const privacyFaqs = [
  {
    question: "How long do you keep my data?",
    answer: "We retain personal data only as long as necessary for the purpose it was collected. Review data is retained while your review is published. Identity verification data is retained for 12 months after your last interaction. Contact form submissions are retained for 24 months. Analytics data is anonymised and retained indefinitely in aggregate form. You can request earlier deletion at any time.",
  },
  {
    question: "Do you use cookies?",
    answer: "Yes, we use essential cookies for session management and security (these are required for the site to function). We also use optional analytics cookies to understand how visitors use our site. You can manage your cookie preferences through your browser settings. We do not use advertising or tracking cookies from third-party networks.",
  },
  {
    question: "Who has access to my review data?",
    answer: "Your review content (text, rating, and recommendation) is published publicly on the provider profile page. Your full name is never displayed publicly — only your reviewer type (learner or employer) and verification badge status appear. Your identity verification evidence is only accessible to our moderation team and is never published.",
  },
  {
    question: "How do you handle data from outside the UK?",
    answer: "Our platform is hosted within the UK and European Economic Area. If you access our site from outside these regions, your data will be transferred to and processed in the UK. We apply the same data protection standards regardless of where you are located.",
  },
  {
    question: "What happens to my data if I delete my account?",
    answer: "If you request deletion, we will remove your personal data and identity verification records. Your published reviews may be anonymised (author shown as 'Former User') rather than deleted, to preserve the integrity of provider review records for other users. You can request full review deletion instead if you prefer.",
  },
  {
    question: "How do you protect children's data?",
    answer: "Apprenticeships are open to individuals aged 16 and over. We do not knowingly collect personal data from anyone under 16 without verified parental consent. If we discover we have collected data from someone under 16 without consent, we will delete it promptly.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/3b4c46c741794d28851b2d3f6aa67155.png"
            alt="Abstract composition representing privacy and data protection"
            className="site-image-hero"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background-50/15 backdrop-blur-sm rounded-full border border-background-50/20 mb-8">
              <i className="ri-lock-line text-white text-sm" />
              <span className="text-sm text-white font-medium">Your Data, Your Trust</span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              How we collect, use, store, and protect your personal data. We believe in transparency — this policy explains exactly what happens with your information.
            </p>
            <p className="mt-4 text-sm text-white/85">
              Last updated: 5 July 2026
            </p>
          </div>
        </div>
      </section>

      {/* ===== OVERVIEW ===== */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                  Our commitment to your privacy
                </h2>
                <p className="mt-4 text-sm md:text-base text-foreground-600 leading-relaxed">
                  ApprenticeshipsReviews is a platform built on trust. Learners and employers share honest feedback about apprenticeship providers, and that trust depends on knowing your personal data is handled responsibly. This policy applies to all data collected through our website, review submission process, and contact forms.
                </p>
                <p className="mt-4 text-sm md:text-base text-foreground-600 leading-relaxed">
                  We comply with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. If you have any questions that this policy does not answer, contact us through our contact page and we will respond within 2 working days.
                </p>
                <div className="mt-6">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full hover:bg-primary-100 transition-colors"
                  >
                    <i className="ri-mail-line text-sm" />
                    Contact us about your data
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {principles.map((p, i) => (
                  <div
                    key={i}
                    className="p-5 bg-background-100 rounded-xl border border-background-200/70 col-span-2 sm:col-span-1"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <i className={`${p.icon} text-base`} />
                      </div>
                      <h3 className="font-heading text-sm font-semibold text-foreground-900">{p.title}</h3>
                    </div>
                    <p className="text-xs text-foreground-600 leading-relaxed">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHAT WE COLLECT ===== */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                What information we collect
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-2xl">
                We only collect information that serves a specific purpose. Here is exactly what we gather and why.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {whatWeCollect.map((cat, i) => (
                <div
                  key={i}
                  className="p-6 bg-background-50 rounded-xl border border-background-200/70"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                      <i className={`${cat.icon} text-lg`} />
                    </div>
                    <h3 className="font-heading text-base font-semibold text-foreground-900">{cat.title}</h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    {cat.items.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm text-foreground-600">
                        <i className="ri-check-line text-primary-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW WE USE DATA ===== */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                How we use your data
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-2xl">
                Every use of your data has a lawful basis under UK GDPR. Here is a clear breakdown.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {lawfulBasis.map((basis, i) => (
                <div key={i} className="p-6 bg-background-100 rounded-xl border border-background-200/70">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border mb-4 ${basis.badgeClass}`}>
                    <i className="ri-check-line text-xs" />
                    {basis.badgeLabel}
                  </div>
                  <h3 className="font-heading text-base font-semibold text-foreground-900 mb-3">{basis.title}</h3>
                  <div className="flex flex-col gap-2.5">
                    {basis.items.map((item) => (
                      <div key={item} className="text-sm text-foreground-600 leading-relaxed">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-secondary-50 dark:bg-secondary-950/40 rounded-xl border border-secondary-200/70 dark:border-secondary-800/40">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-secondary-100 text-secondary-600">
                  <i className="ri-information-line text-base" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-semibold text-foreground-900 mb-1">We do not use your data for:</h4>
                  <div className="flex flex-col gap-1">
                    {[
                      "Automated decision-making or profiling that produces legal effects",
                      "Direct marketing without your explicit consent",
                      "Selling, renting, or trading data to third parties",
                    ].map((item) => (
                      <div key={item} className="text-sm text-foreground-600 leading-relaxed flex items-start gap-2">
                        <i className="ri-close-line text-secondary-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== YOUR RIGHTS ===== */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                Your rights under UK GDPR
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-2xl">
                You have the following rights regarding your personal data. To exercise any of them, contact us through our contact page.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userRights.map((right, i) => (
                <div
                  key={i}
                  className="p-5 bg-background-50 rounded-xl border border-background-200/70"
                >
                  <h3 className="font-heading text-sm font-semibold text-foreground-900 mb-1.5">{right.name}</h3>
                  <p className="text-xs text-foreground-600 leading-relaxed">{right.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-5 bg-primary-50 dark:bg-primary-950/40 rounded-xl border border-primary-100/50 dark:border-primary-800/40">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                  <i className="ri-alert-line text-base" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-semibold text-foreground-900 mb-1">Making a complaint</h4>
                  <p className="text-sm text-foreground-600 leading-relaxed">
                    If you are not satisfied with how we handle your data, you have the right to complain to the UK Information Commissioner's Office (ICO). We would appreciate the opportunity to address your concerns first — please contact us before escalating.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COOKIES ===== */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                  Cookie usage
                </h2>
                <p className="mt-3 text-sm text-foreground-600 leading-relaxed">
                  We keep cookies to a minimum. Here is what we use and why.
                </p>
              </div>
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                      Essential
                    </span>
                    <h3 className="font-heading text-sm font-semibold text-foreground-900">Session and security cookies</h3>
                  </div>
                  <p className="text-sm text-foreground-600 leading-relaxed">
                    Required for the website to function. These maintain your session state, remember your cookie preferences, and protect against cross-site request forgery. They do not track you across other websites and are deleted when you close your browser.
                  </p>
                </div>
                <div className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium">
                      Optional
                    </span>
                    <h3 className="font-heading text-sm font-semibold text-foreground-900">Analytics cookies</h3>
                  </div>
                  <p className="text-sm text-foreground-600 leading-relaxed">
                    We use anonymised analytics to understand how visitors use our site — which pages are popular, how people find us, and where we can improve. These cookies do not identify you personally. You can opt out at any time through your browser settings.
                  </p>
                </div>
                <div className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-foreground-100 text-foreground-600 rounded-md text-xs font-medium">
                      None
                    </span>
                    <h3 className="font-heading text-sm font-semibold text-foreground-900">Third-party and advertising cookies</h3>
                  </div>
                  <p className="text-sm text-foreground-600 leading-relaxed">
                    We do not use any third-party advertising or tracking cookies. No Facebook pixels, no Google Ads tracking, no retargeting networks. Our business model does not depend on selling your attention to advertisers.
                  </p>
                </div>
              </div>
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
                Common privacy questions
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base">
                Answers to the data protection questions we hear most often.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {privacyFaqs.map((faq, i) => (
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
              Questions about your data?
            </h2>
            <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              If you want to access, correct, or delete your data — or if anything in this policy is unclear — get in touch and we will help.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-3.5 bg-background-50 text-primary-700 text-sm font-semibold rounded-lg hover:bg-background-100 transition-colors whitespace-nowrap"
              >
                Contact us
              </Link>
              <Link
                to="/review-policy"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white text-sm font-semibold rounded-lg border border-background-50/30 hover:bg-background-50/10 transition-colors whitespace-nowrap"
              >
                Review Policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}