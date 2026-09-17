import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

const definitionTerms = [
  {
    term: "Platform",
    description: "The ApprenticeshipsReviews website, including all pages, features, tools, data displays, and review functionality accessible at the primary domain and any subdomains we operate.",
  },
  {
    term: "We / Us / Our",
    description: "The operators and administrators of ApprenticeshipsReviews, including our moderation team, data analysts, and any authorised representatives acting on behalf of the platform.",
  },
  {
    term: "You / User",
    description: "Any individual or organisation accessing the platform, whether browsing provider profiles, reading reviews, submitting a review, listing a provider, or using any other feature.",
  },
  {
    term: "Provider",
    description: "An apprenticeship training provider listed on the platform, whether claimed and managed by the provider or created from public data sources by our team.",
  },
  {
    term: "Reviewer",
    description: "A user who submits a review of an apprenticeship provider. Reviewers may be learners who completed an apprenticeship or employers who hired apprentices through a provider.",
  },
  {
    term: "Content",
    description: "All text, ratings, data, images, and any other material displayed on the platform, whether submitted by users, extracted from public sources, or created by our team.",
  },
];

const accountRules = [
  {
    icon: "ri-user-smile-line",
    title: "Provide accurate information",
    description: "When creating an account or submitting a review, you must provide truthful and accurate information about your identity and experience. Misrepresentation, including impersonation of another person or organisation, is grounds for immediate account suspension and review removal.",
  },
  {
    icon: "ri-shield-keyhole-line",
    title: "Keep your account secure",
    description: "You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorised access to your account. We are not liable for any loss arising from your failure to secure your account.",
  },
  {
    icon: "ri-user-unfollow-line",
    title: "One account per person",
    description: "Each individual may hold only one account. Creating multiple accounts to post duplicate reviews, manipulate ratings, or circumvent restrictions is prohibited. Multiple accounts linked to the same identity will be merged or suspended at our discretion.",
  },
  {
    icon: "ri-forbid-2-line",
    title: "Eligibility",
    description: "You must be at least 16 years old to create an account or submit a review. By using the platform, you confirm you meet this age requirement. We do not knowingly collect data from users under 16 without verified parental consent.",
  },
];

const acceptableUse = [
  {
    icon: "ri-close-circle-line",
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Prohibited",
    items: [
      "Posting false, misleading, or fraudulent reviews about any provider",
      "Using automated tools, bots, or scripts to submit reviews, scrape data, or manipulate ratings",
      "Posting content that is defamatory, abusive, harassing, threatening, or discriminatory",
      "Impersonating another person, organisation, or creating fake provider listings",
      "Uploading malware, viruses, or any malicious code through the platform",
      "Attempting to reverse-engineer, decompile, or extract our source code or algorithms",
      "Using the platform to promote competing services or for unsolicited advertising",
      "Collecting or harvesting user data, email addresses, or review content without consent",
      "Bypassing or attempting to bypass our moderation, identity verification, or security measures",
      "Using the platform for any unlawful purpose under UK law",
    ],
  },
  {
    icon: "ri-check-line",
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Encouraged",
    items: [
      "Reading and comparing provider profiles to make informed apprenticeship decisions",
      "Submitting honest, detailed reviews based on your personal experience",
      "Reporting suspicious reviews or provider profiles using our reporting tools",
      "Contacting us with questions, concerns, or suggestions for improvement",
      "Sharing provider profile links with colleagues, learners, and employers who may benefit",
      "Citing our data and methodology in your own research with proper attribution",
    ],
  },
];

const liabilityPoints = [
  {
    title: "Information accuracy",
    description: "We source provider data from public registers, government publications, and user reviews. While we cross-reference multiple sources and update data on a regular schedule, we cannot guarantee that all information is current, complete, or error-free at all times. Users should verify critical information directly with providers before making enrolment or contracting decisions.",
  },
  {
    title: "No professional advice",
    description: "The platform provides information and comparison tools for educational and decision-support purposes only. We do not provide legal, financial, or educational advice. Any decisions you make based on platform information, including choice of apprenticeship provider or standard, are made at your own discretion and risk.",
  },
  {
    title: "Third-party content",
    description: "Reviews, ratings, and user-submitted content reflect the views of individual users and do not represent our views or endorsements. Provider profile information is sourced from third-party public data. We are not responsible for the accuracy, completeness, or reliability of third-party content displayed on the platform.",
  },
  {
    title: "External links",
    description: "The platform may contain links to external websites, including provider websites, government registers, and partner organisations. We do not control, endorse, or assume responsibility for the content, privacy practices, or availability of any external site. You access external links at your own risk.",
  },
  {
    title: "Service availability",
    description: "We strive to maintain continuous platform availability but do not guarantee uninterrupted access. We may suspend or restrict access for maintenance, security updates, or circumstances beyond our reasonable control. We will make reasonable efforts to notify users of planned downtime.",
  },
  {
    title: "Limitation of liability",
    description: "To the fullest extent permitted by UK law, ApprenticeshipsReviews and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, including but not limited to loss of profits, business interruption, loss of data, or reputational harm.",
  },
];

const termsFaqs = [
  {
    question: "Can I use ApprenticeshipsReviews data on my own website?",
    answer: "You may reference and cite our data with proper attribution (a link to the source page and mention of ApprenticeshipsReviews). However, you may not systematically scrape, reproduce, or republish substantial portions of our data, provider profiles, or review content without prior written permission. For data licensing enquiries, contact us through our contact page.",
  },
  {
    question: "What happens if I violate these terms?",
    answer: "Depending on the severity and nature of the violation, we may issue a warning, temporarily suspend your account, permanently terminate your account, remove violating content, restrict your ability to submit reviews, or take legal action where appropriate. We will inform you of any action taken unless doing so would compromise an investigation or is prohibited by law.",
  },
  {
    question: "Can a provider request changes to their profile information?",
    answer: "Providers listed from public data sources can contact us to correct factual errors (wrong contact details, incorrect standard listings, outdated inspection data). We will verify the correction against public sources before updating. Providers cannot request the removal of unfavourable public data (such as Ofsted grades or ESFA achievement rates) if the data is accurate and current.",
  },
  {
    question: "Who owns the content I submit?",
    answer: "You retain ownership of the review content you write. By submitting a review, you grant us a non-exclusive, royalty-free, perpetual, worldwide licence to display, distribute, and use your review content on the platform and in related materials (such as provider comparison summaries). You can request removal of your review at any time, and we will comply within 2 working days.",
  },
  {
    question: "How will I be notified of changes to these terms?",
    answer: "We will post a notice on the platform and, for significant changes, send an email to registered users at least 14 days before the changes take effect. Continued use of the platform after the effective date constitutes acceptance of the updated terms. If you do not agree with the changes, you should stop using the platform and may request account deletion.",
  },
  {
    question: "Which country's laws apply?",
    answer: "These terms are governed by the laws of England and Wales. Any disputes arising from these terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts of England and Wales. If you are accessing the platform from outside the UK, you are responsible for compliance with local laws where applicable.",
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://readdy.ai/api/search-image?query=Two%20professionals%20reviewing%20a%20contract%20together%20at%20a%20desk%20in%20a%20calm%20modern%20office%2C%20thoughtful%20collaboration%20over%20paperwork%2C%20warm%20natural%20light%2C%20soft%20beige%20and%20amber%20tones%20with%20subtle%20teal%20accents%2C%20editorial%20photography%2C%20shallow%20depth%20of%20field%2C%20high%20detail%2C%20realistic%20professional%20atmosphere&width=1600&height=650&seq=terms-hero-01&orientation=landscape&nocache=true"
            alt="Abstract composition representing legal frameworks and structured agreements"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background-50/15 backdrop-blur-sm rounded-full border border-background-50/20 mb-8">
              <i className="ri-scales-3-line text-white text-sm" />
              <span className="text-sm text-white font-medium">Legal Information</span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              The rules, rights, and responsibilities that apply when you use ApprenticeshipsReviews. By using our platform, you agree to these terms. Please read them carefully.
            </p>
            <p className="mt-4 text-sm text-white/85">
              Last updated: 5 July 2026
            </p>
          </div>
        </div>
      </section>

      {/* ===== ACCEPTANCE ===== */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                  Acceptance of terms
                </h2>
                <p className="mt-4 text-sm md:text-base text-foreground-600 leading-relaxed">
                  By accessing or using ApprenticeshipsReviews, including browsing provider profiles, reading reviews, submitting a review, creating an account, or using any feature of the platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
                <p className="mt-4 text-sm md:text-base text-foreground-600 leading-relaxed">
                  If you do not agree to these terms, you should not use the platform. These terms form a legally binding agreement between you and ApprenticeshipsReviews. We may update these terms from time to time, and your continued use after changes are posted constitutes acceptance of the revised terms.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/privacy-policy"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full hover:bg-primary-100 transition-colors"
                  >
                    <i className="ri-lock-line text-sm" />
                    Privacy Policy
                  </Link>
                  <Link
                    to="/review-policy"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-background-100 text-foreground-700 text-sm font-semibold rounded-lg hover:bg-background-200 transition-colors"
                  >
                    <i className="ri-shield-check-line text-sm" />
                    Review Policy
                  </Link>
                </div>
              </div>
              <div className="p-6 bg-primary-50 dark:bg-primary-950/40 rounded-xl border border-primary-100/50 dark:border-primary-800/40">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                    <i className="ri-information-line text-base" />
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-foreground-900">Related documents</h3>
                </div>
                <p className="text-sm text-foreground-600 leading-relaxed mb-4">
                  These Terms of Service should be read together with our Privacy Policy, which explains how we handle your personal data, and our Review Policy, which explains our moderation and verification standards. All three documents govern your use of the platform.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Privacy Policy", path: "/privacy-policy" },
                    { label: "Review Policy", path: "/review-policy" },
                    { label: "Data Sources", path: "/data-sources" },
                  ].map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="text-sm text-primary-700 hover:text-primary-800 transition-colors flex items-center gap-1.5"
                    >
                      <i className="ri-arrow-right-s-line text-sm" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DEFINITIONS ===== */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                Key definitions
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-2xl">
                To avoid ambiguity, here is what specific terms mean throughout this document and across the platform.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {definitionTerms.map((def, i) => (
                <div key={i} className="p-5 bg-background-50 rounded-xl border border-background-200/70">
                  <h3 className="font-heading text-sm font-semibold text-primary-600 mb-1.5">{def.term}</h3>
                  <p className="text-xs text-foreground-600 leading-relaxed">{def.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== USER ACCOUNTS ===== */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                User accounts and responsibilities
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-2xl">
                Creating an account is optional for browsing but required for submitting reviews. Here are your responsibilities when you create one.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {accountRules.map((rule, i) => (
                <div key={i} className="p-6 bg-background-100 rounded-xl border border-background-200/70">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                      <i className={`${rule.icon} text-lg`} />
                    </div>
                    <h3 className="font-heading text-base font-semibold text-foreground-900">{rule.title}</h3>
                  </div>
                  <p className="text-sm text-foreground-600 leading-relaxed">{rule.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== ACCEPTABLE USE ===== */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                Acceptable use
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-2xl">
                A clear distinction between what is not allowed and what we encourage.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {acceptableUse.map((section, i) => (
                <div key={i} className="p-6 bg-background-50 rounded-xl border border-background-200/70">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${section.bg} ${section.color}`}>
                      <i className={`${section.icon} text-base`} />
                    </div>
                    <h3 className="font-heading text-base font-semibold text-foreground-900">{section.label}</h3>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {section.items.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm text-foreground-600">
                        <i className={`${section.icon} ${section.color} flex-shrink-0 mt-0.5 text-xs`} />
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

      {/* ===== LIABILITY ===== */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                Disclaimers and limitation of liability
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-2xl">
                We are transparent about what we can and cannot guarantee. These disclaimers protect both you and us.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {liabilityPoints.map((point, i) => (
                <div key={i} className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-foreground-500 bg-background-50 px-2 py-0.5 rounded-full border border-background-200/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-heading text-sm font-semibold text-foreground-900">{point.title}</h3>
                  </div>
                  <p className="text-xs text-foreground-600 leading-relaxed">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TERMINATION ===== */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                  Termination and changes
                </h2>
                <div className="mt-6 flex flex-col gap-4">
                  <div className="p-4 bg-background-50 rounded-xl border border-background-200/70">
                    <h3 className="font-heading text-sm font-semibold text-foreground-900 mb-1">
                      Termination by us
                    </h3>
                    <p className="text-sm text-foreground-600 leading-relaxed">
                      We reserve the right to suspend or terminate your access to the platform at any time, with or without notice, if we reasonably believe you have violated these terms, engaged in fraudulent activity, or otherwise misused the platform. We will provide an explanation where feasible and appropriate.
                    </p>
                  </div>
                  <div className="p-4 bg-background-50 rounded-xl border border-background-200/70">
                    <h3 className="font-heading text-sm font-semibold text-foreground-900 mb-1">
                      Termination by you
                    </h3>
                    <p className="text-sm text-foreground-600 leading-relaxed">
                      You may stop using the platform and delete your account at any time. To request account deletion, contact us through our contact page. Upon deletion, your personal data will be handled in accordance with our Privacy Policy. Published reviews may be anonymised at your request.
                    </p>
                  </div>
                  <div className="p-4 bg-background-50 rounded-xl border border-background-200/70">
                    <h3 className="font-heading text-sm font-semibold text-foreground-900 mb-1">
                      Changes to these terms
                    </h3>
                    <p className="text-sm text-foreground-600 leading-relaxed">
                      We may update these Terms of Service at any time. Material changes will be communicated through a platform notice and, for registered users, an email notification at least 14 days before the changes take effect. The date at the top of this page indicates when the terms were last revised.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-primary-50 dark:bg-primary-950/40 rounded-xl border border-primary-100/50 dark:border-primary-800/40">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-50 text-primary-500 mb-3">
                  <i className="ri-building-line text-lg" />
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground-900 mb-2">Governing law</h3>
                <p className="text-sm text-foreground-600 leading-relaxed mb-4">
                  These Terms of Service and any dispute arising from them shall be governed by and construed in accordance with the laws of England and Wales. The courts of England and Wales shall have exclusive jurisdiction over any claim or dispute relating to these terms or your use of the platform.
                </p>
                <p className="text-sm text-foreground-600 leading-relaxed mb-4">
                  If any provision of these terms is found to be unenforceable or invalid by a court of competent jurisdiction, the remaining provisions shall remain in full force and effect. Our failure to enforce any right or provision in these terms shall not constitute a waiver of that right or provision.
                </p>
                <p className="text-sm text-foreground-600 leading-relaxed">
                  These terms constitute the entire agreement between you and ApprenticeshipsReviews regarding your use of the platform, superseding any prior agreements or understandings, whether written or oral.
                </p>
              </div>
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
                Frequently asked questions
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base">
                Common questions about our terms, rights, and responsibilities.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {termsFaqs.map((faq, i) => (
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
              Questions about these terms?
            </h2>
            <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              If anything in these Terms of Service is unclear, or if you need to report a violation or discuss a legal matter, get in touch and we will respond promptly.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-3.5 bg-background-50 text-primary-700 text-sm font-semibold rounded-lg hover:bg-background-100 transition-colors whitespace-nowrap"
              >
                Contact us
              </Link>
              <Link
                to="/privacy-policy"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white text-sm font-semibold rounded-lg border border-background-50/30 hover:bg-background-50/10 transition-colors whitespace-nowrap"
              >
                Privacy Policy
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