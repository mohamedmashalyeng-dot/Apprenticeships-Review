import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

const verificationSteps = [
  {
    step: "01",
    icon: "ri-user-add-line",
    title: "Reviewer Identity Check",
    description:
      "When you submit a review, we verify your identity through a combination of checks including your apprenticeship standard, provider name, and completion status. We may ask for additional evidence such as an apprenticeship certificate, enrolment confirmation, or employer reference. This step filters out fake submissions before they reach moderation.",
  },
  {
    step: "02",
    icon: "ri-shield-check-line",
    title: "Automated Content Scan",
    description:
      "Every review passes through an automated scan that checks for spam patterns, offensive language, personally identifiable information, promotional content, and AI-generated text markers. Reviews that trigger flags are reviewed more carefully by our moderation team rather than being silently rejected.",
  },
  {
    step: "03",
    icon: "ri-user-search-line",
    title: "Manual Moderation",
    description:
      "Our moderation team manually reviews flagged reviews and a random sample of unflagged ones. They check for consistency \u2014 does the reviewer mention details that match the provider and standard? Are there unrealistic claims? Does the review contain specific, actionable detail or just vague praise or criticism?",
  },
  {
    step: "04",
    icon: "ri-check-double-line",
    title: "Verification Badge Assignment",
    description:
      "Reviews that pass all checks receive a 'Verified' badge. Reviews that are still under review show 'Pending Verification'. If a review cannot be verified but does not violate guidelines, it may be published without a badge. We never publish reviews that fail our authenticity checks.",
  },
];

const guidelines = [
  {
    icon: "ri-file-text-line",
    title: "Be specific and balanced",
    description:
      "Describe your actual experience with concrete detail. Mention tutor quality, support responsiveness, workload, delivery format, and outcomes. Balanced reviews that mention both strengths and areas for improvement are more credible and helpful to other users than all-positive or all-negative submissions.",
  },
  {
    icon: "ri-group-line",
    title: "Write about your own experience",
    description:
      "Reviews must reflect your personal, first-hand experience as a learner or employer. Do not submit reviews on behalf of someone else, do not copy reviews from other platforms, and do not submit the same review across multiple providers. Each review should be unique.",
  },
  {
    icon: "ri-price-tag-3-line",
    title: "No promotional or incentivised content",
    description:
      "Reviews must not include promotional content, affiliate links, discount codes, or marketing language. We do not allow incentivised reviews \u2014 reviews written in exchange for payment, gifts, or preferential treatment. If we discover a review was incentivised, it will be removed and the provider may be flagged.",
  },
  {
    icon: "ri-lock-line",
    title: "Protect personal information",
    description:
      "Do not include your full name, address, phone number, email, or anyone else's personal information in your review text. Your identity is verified separately and is never displayed publicly. Reviews containing personal data will be edited or removed.",
  },
  {
    icon: "ri-emotion-happy-line",
    title: "Keep it constructive",
    description:
      "Even negative experiences can be described constructively. Instead of 'the provider is terrible', explain what specifically went wrong, how it affected your apprenticeship, and what you think the provider should have done differently. Constructive criticism is more useful to readers and more credible.",
  },
  {
    icon: "ri-time-line",
    title: "Submit timely, relevant reviews",
    description:
      "Reviews are most valuable when they reflect recent experience. If you completed your apprenticeship three years ago, your review is still welcome \u2014 just note the time period so readers have context. We display review dates prominently so users can judge recency.",
  },
];

const modFaqs = [
  {
    question: "How long does verification take?",
    answer:
      "Most reviews are processed within 2-3 working days. During peak periods or when additional identity evidence is requested, it may take up to 5 working days. You will receive an email notification when your review is published or if we need more information from you.",
  },
  {
    question: "Can a provider get negative reviews removed?",
    answer:
      "No. Providers cannot request the removal of reviews simply because they are negative. We only remove reviews that violate our community guidelines \u2014 for example, if they contain personal information, offensive language, promotional content, or are demonstrably false. Honest negative reviews that meet our guidelines will always stay published.",
  },
  {
    question: "What happens if I see a suspicious review?",
    answer:
      "Every review card includes a 'Report' button. Clicking it opens a short form where you can explain your concern. Our moderation team reviews every report within 3 working days. If the review is found to violate guidelines, it will be removed. If it passes re-review, it stays with a note that it was reported and re-checked.",
  },
  {
    question: "Do you verify employer reviews differently?",
    answer:
      "Employer reviews go through the same identity verification and moderation process as learner reviews. However, we apply additional checks for employer reviews \u2014 for example, we may ask for evidence of the employer\u2019s relationship with the provider, such as an apprenticeship agreement or invoice, to prevent fake employer accounts.",
  },
  {
    question: "How do you handle providers with very few reviews?",
    answer:
      "Providers with fewer than 5 reviews show a notice that the sample size is small. We do not calculate an average rating for providers with fewer than 3 reviews because a single review is not statistically meaningful. As the platform grows and more reviews are collected, this threshold becomes less of an issue for most providers.",
  },
  {
    question: "Can I edit or delete my review after posting?",
    answer:
      "Yes. You can edit your review at any time through the same email-based verification used when you submitted it. Edited reviews go through moderation again before the changes appear publicly. You can also request deletion of your review entirely, and we will remove it within 2 working days.",
  },
  {
    question: "What is your policy on AI-generated reviews?",
    answer:
      "We do not accept AI-generated reviews. Our automated scan includes AI-text detection, and our manual moderators are trained to identify unnatural language patterns, generic phrasing, and lack of specific detail that signals machine-generated content. Submitting AI-generated reviews may result in your account being restricted from future submissions.",
  },
  {
    question: "Are reviews moderated before or after publication?",
    answer:
      "Reviews are moderated before publication. No review appears on the site until it has passed both automated and manual checks. This means there may be a short delay between submission and publication, but it ensures that everything you see on the platform has already been reviewed for quality and authenticity.",
  },
];

export default function ReviewPolicy() {
  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/19ea4b1b1d944b5697a6bbab1fdf9439.png"
            alt="Abstract composition representing trust, verification, and review authenticity"
            width={707}
            height={333}
            className="site-image-hero"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background-50/15 backdrop-blur-sm rounded-full border border-background-50/20 mb-8">
              <i className="ri-shield-check-line text-white text-sm" />
              <span className="text-sm text-white font-medium">Trust & Transparency</span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              How we ensure review quality and authenticity
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              Every review on ApprenticeshipsReviews goes through identity verification, automated scanning, and manual moderation before it appears publicly. Here is exactly how we protect the integrity of our reviews.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/add-review"
                className="w-full sm:w-auto px-8 py-3.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors whitespace-nowrap"
              >
                Add a Review
              </Link>
              <Link
                to="/reviews"
                className="w-full sm:w-auto px-8 py-3.5 bg-background-50/15 backdrop-blur-sm text-white text-sm font-semibold rounded-lg border border-background-50/25 hover:bg-background-50/25 transition-colors whitespace-nowrap"
              >
                Browse reviews
              </Link>
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
                  Real reviews from real people, always
                </h2>
                <p className="mt-4 text-sm md:text-base text-foreground-600 leading-relaxed">
                  Review platforms lose credibility fast when reviews are fake, incentivised, or unmoderated. We designed our review system from the ground up to prevent those problems. Every review is tied to a verified identity, scanned for authenticity, and manually checked by a human moderator before it ever appears on the site.
                </p>
                <p className="mt-4 text-sm md:text-base text-foreground-600 leading-relaxed">
                  We do not allow providers to pay for reviews, remove negative reviews on request, or game the system through bulk submissions. Our moderation team operates independently and follows published guidelines. When we make a moderation decision, we can explain why \u2014 and we do, when users ask.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200/70">
                    <i className="ri-checkbox-circle-line text-sm" />
                    Identity-verified
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200/70">
                    <i className="ri-checkbox-circle-line text-sm" />
                    Human-moderated
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200/70">
                    <i className="ri-checkbox-circle-line text-sm" />
                    No incentivised reviews
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200/70">
                    <i className="ri-checkbox-circle-line text-sm" />
                    Audit trail maintained
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <p className="text-3xl font-bold text-primary-600 font-heading">4</p>
                  <p className="mt-1 text-sm text-foreground-600">Verification check stages before publication</p>
                </div>
                <div className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <p className="text-3xl font-bold text-primary-600 font-heading">2&ndash;3 days</p>
                  <p className="mt-1 text-sm text-foreground-600">Typical turnaround from submission to publication</p>
                </div>
                <div className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <p className="text-3xl font-bold text-secondary-600 font-heading">100%</p>
                  <p className="mt-1 text-sm text-foreground-600">Of reviews manually moderated before publication</p>
                </div>
                <div className="p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <p className="text-3xl font-bold text-primary-600 font-heading">0</p>
                  <p className="mt-1 text-sm text-foreground-600">Incentivised reviews accepted, ever</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VERIFICATION PROCESS ===== */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                The verification process
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-xl mx-auto">
                Four stages every review goes through \u2014 from submission to publication.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {verificationSteps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-6 bg-background-50 rounded-xl border border-background-200/70"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <i className={`${step.icon} text-xl`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                        Step {step.step}
                      </span>
                      <h3 className="font-heading text-base font-semibold text-foreground-900">{step.title}</h3>
                    </div>
                    <p className="text-sm text-foreground-600 leading-relaxed mt-2">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== VERIFICATION BADGES ===== */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                Understanding verification badges
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-2xl">
                Each review displays a verification badge that tells you its status. Here is what each badge means.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 bg-background-100 rounded-xl border border-background-200/70">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200/70 mb-4">
                  <i className="ri-checkbox-circle-line text-sm" />
                  Verified
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground-900 mb-2">Verified Review</h3>
                <p className="text-sm text-foreground-600 leading-relaxed">
                  The reviewer\u2019s identity has been confirmed, the content passed automated scanning, and a human moderator has approved it. This is the highest level of confidence we can provide in a review\u2019s authenticity. Most reviews on the platform carry this badge.
                </p>
              </div>
              <div className="p-6 bg-background-100 rounded-xl border border-background-200/70">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-200/70 mb-4">
                  <i className="ri-time-line text-sm" />
                  Pending Verification
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground-900 mb-2">Pending Verification</h3>
                <p className="text-sm text-foreground-600 leading-relaxed">
                  The review has been submitted and passed automated checks but is awaiting manual moderation. This is common for reviews submitted within the last 2-3 days. The badge updates automatically once moderation is complete.
                </p>
              </div>
              <div className="p-6 bg-background-100 rounded-xl border border-background-200/70">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground-100 text-foreground-600 rounded-lg text-xs font-medium border border-foreground-200/70 mb-4">
                  <i className="ri-information-line text-sm" />
                  Unverified
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground-900 mb-2">Unverified Review</h3>
                <p className="text-sm text-foreground-600 leading-relaxed">
                  The reviewer\u2019s identity could not be fully confirmed through our standard checks, but the content does not violate our guidelines. These reviews are rare and are clearly labelled. We recommend reading them with the understanding that less identity verification has been performed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMMUNITY GUIDELINES ===== */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">
                Community guidelines for reviewers
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-2xl">
                These guidelines help keep reviews helpful, credible, and fair for everyone.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {guidelines.map((g, i) => (
                <div
                  key={i}
                  className="p-6 bg-background-50 rounded-xl border border-background-200/70"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600 mb-4">
                    <i className={`${g.icon} text-lg`} />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-foreground-900 mb-2">{g.title}</h3>
                  <p className="text-sm text-foreground-600 leading-relaxed">{g.description}</p>
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
                Moderation & policy questions
              </h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base">
                Common questions about how we handle reviews, moderation, and disputes.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {modFaqs.map((faq, i) => (
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
              Your review helps others choose better
            </h2>
            <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Whether you are a learner who completed an apprenticeship or an employer who hired one, sharing your experience makes the market more transparent for everyone.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/add-review"
                className="w-full sm:w-auto px-8 py-3.5 bg-background-50 text-primary-700 text-sm font-semibold rounded-lg hover:bg-background-100 transition-colors whitespace-nowrap"
              >
                Add a Review
              </Link>
              <Link
                to="/reviews"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white text-sm font-semibold rounded-lg border border-background-50/30 hover:bg-background-50/10 transition-colors whitespace-nowrap"
              >
                Read Reviews
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
