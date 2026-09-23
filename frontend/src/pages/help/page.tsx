import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

interface FaqItem {
  question: string;
  answer: string;
}

const sections: { id: string; label: string; icon: string; faqs: FaqItem[] }[] = [
  {
    id: "apprentices",
    label: "For Apprentices",
    icon: "ri-graduation-cap-line",
    faqs: [
      { question: "How do I find an apprenticeship provider?", answer: "Use our Find a Provider page to search by name, location, sector, and level. You can also browse by category or compare providers side by side to narrow down your options." },
      { question: "How do I leave a review?", answer: "Click 'Write a Review' and follow the steps. You'll select your provider, programme, and level, then rate your experience across several categories and write your review." },
      { question: "Do I need to pay to use this site?", answer: "No. ApprenticeshipsReviews is completely free for apprentices and employers to browse, compare, and leave reviews." },
      { question: "What is an apprenticeship level?", answer: "Apprenticeship levels range from Level 2 (GCSE equivalent) to Level 7 (Master's equivalent). Each standard has a specific level that reflects its difficulty and typical entry requirements." },
    ],
  },
  {
    id: "providers",
    label: "For Providers",
    icon: "ri-building-4-line",
    faqs: [
      { question: "How do I claim my provider profile?", answer: "Visit the Claim your profile page and complete the verification form. We'll verify your connection to the organisation before granting you access to manage the profile." },
      { question: "Can I respond to reviews?", answer: "Yes. Once your profile is claimed and verified, you can respond publicly to individual reviews from your provider dashboard." },
      { question: "Can I remove negative reviews?", answer: "No. We only remove reviews that violate our guidelines (personal info, fake content, abuse, etc.). Honest negative reviews stay published, but you can respond to them publicly." },
      { question: "How do I correct inaccurate profile data?", answer: "Contact us with evidence, or use your provider dashboard once verified. We'll confirm corrections against public sources before updating your profile." },
    ],
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: "ri-chat-quote-line",
    faqs: [
      { question: "How are ratings calculated?", answer: "Overall ratings are the average of all verified reviews for a provider. We also calculate category ratings (tutor support, training quality, etc.) and a recommendation percentage." },
      { question: "What does 'Verified Apprentice' mean?", answer: "A verified review has passed our identity checks — the reviewer confirmed their enrolment or completion through evidence. Unverified reviews are clearly labelled." },
      { question: "How long does review moderation take?", answer: "Most reviews are processed within 2–3 working days. During busy periods it can take up to 5 working days." },
      { question: "Can I edit or delete my review?", answer: "Yes. You can edit your review through your account dashboard, and edits go through moderation again before appearing. You can also request deletion." },
    ],
  },
  {
    id: "accounts",
    label: "Accounts",
    icon: "ri-user-settings-line",
    faqs: [
      { question: "Do I need an account to read reviews?", answer: "No. You can browse providers, read reviews, and compare without an account. You only need an account to write reviews or manage a provider profile." },
      { question: "How do I register?", answer: "Click 'Log in' and choose 'Create an account'. Select whether you're registering as an apprentice or a training provider, then follow the prompts." },
      { question: "What can I do in my apprentice dashboard?", answer: "See your reviews and their status, edit eligible reviews, manage saved/favourite providers, and update your account settings." },
      { question: "I forgot my password. What do I do?", answer: "Use the 'Forgot password' link on the login page. We'll email you a secure link to reset it." },
    ],
  },
  {
    id: "verification",
    label: "Verification",
    icon: "ri-shield-check-line",
    faqs: [
      { question: "How do you verify reviews?", answer: "We verify reviewer identity through enrolment evidence, employer confirmation, or email verification, then run automated scans and manual moderation before publication." },
      { question: "Why was my review not verified?", answer: "If we couldn't confirm your enrolment or the review didn't pass our checks, it may stay unverified. Contact us if you believe this is an error and we'll review it." },
      { question: "How do you verify providers?", answer: "Providers are verified against the Register of Apprenticeship Training Providers (RoATP) using their UKPRN number. Claimed profiles undergo additional ownership verification." },
    ],
  },
  {
    id: "reporting",
    label: "Reporting",
    icon: "ri-flag-line",
    faqs: [
      { question: "How do I report a review?", answer: "Click the 'Report' button on any review. Choose a reason (fake review, offensive content, personal information, etc.) and submit. Our team reviews every report." },
      { question: "What happens after I report something?", answer: "Our moderation team reviews reports within 3 working days. If the content violates guidelines, it's removed. If not, it stays published." },
      { question: "How do I report a data error?", answer: "Use our contact page and select 'Report a data error'. Include the specific issue and any evidence you have." },
    ],
  },
];

export default function Help() {
  const [activeSection, setActiveSection] = useState("apprentices");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const currentSection = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/19ea4b1b1d944b5697a6bbab1fdf9439.png"
            alt="Abstract background representing help and support"
            width={707}
            height={333}
            className="site-image-hero"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
              Help Centre
            </h1>
            <p className="mt-3 text-sm md:text-base text-white/90 max-w-2xl mx-auto">
              Answers to common questions for apprentices, training providers, and everyone in between.
            </p>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Section nav */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="lg:sticky lg:top-24 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1">
                  {sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveSection(s.id);
                        setOpenFaq(null);
                      }}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        activeSection === s.id
                          ? "bg-primary-500 text-white"
                          : "bg-background-100 text-foreground-600 hover:bg-background-200"
                      }`}
                    >
                      <i className={s.icon} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div className="flex-1 min-w-0">
                <h2 className="font-heading text-xl font-bold text-foreground-900 mb-6">
                  {currentSection.label}
                </h2>
                <div className="flex flex-col gap-3">
                  {currentSection.faqs.map((faq, i) => {
                    const key = `${currentSection.id}-${i}`;
                    const isOpen = openFaq === key;
                    return (
                      <div
                        key={key}
                        className="bg-background-100 border border-background-200/70 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : key)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                        >
                          <span className="text-sm font-medium text-foreground-800 pr-4">{faq.question}</span>
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-background-200 text-foreground-500">
                            <i className={`text-sm ${isOpen ? "ri-subtract-line" : "ri-add-line"}`} />
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4">
                            <p className="text-sm text-foreground-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Still need help */}
                <div className="mt-10 p-6 bg-primary-50 dark:bg-primary-950/40 border border-primary-100/50 dark:border-primary-800/40 rounded-2xl text-center">
                  <h3 className="font-heading text-base font-semibold text-foreground-900 mb-2">
                    Still need help?
                  </h3>
                  <p className="text-sm text-foreground-600 mb-4">
                    If you can't find the answer you're looking for, our team is happy to help.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors whitespace-nowrap"
                  >
                    Contact us
                    <i className="ri-arrow-right-line" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
