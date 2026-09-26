import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import AnimateOnScroll from "@/components/feature/AnimateOnScroll";

const values = [
  { icon: "ri-eye-line", title: "Transparency", description: "Every score, rating, and data point is traceable to a public source. Nothing is hidden or estimated." },
  { icon: "ri-shield-check-line", title: "Independence", description: "We are not funded by training providers. Our reviews and rankings cannot be bought or influenced." },
  { icon: "ri-user-heart-line", title: "Apprentice-first", description: "Everything we build is designed to help apprentices and employers make better, more confident decisions." },
  { icon: "ri-scales-3-line", title: "Fairness", description: "Providers get a fair hearing — they can respond publicly to reviews and correct factual errors." },
];

const principles = [
  { icon: "ri-questionnaire-line", title: "Who can leave a review", description: "Anyone who has genuine first-hand experience as an apprentice or employer with a listed training provider." },
  { icon: "ri-shield-star-line", title: "Verified reviews", description: "Every review goes through identity verification and moderation before it appears publicly." },
  { icon: "ri-message-2-line", title: "Provider responses", description: "Providers can respond publicly to reviews, so you see both sides of the story." },
  { icon: "ri-flag-line", title: "Report & moderation", description: "Anyone can report a review. Our team reviews every report and removes content that breaks the guidelines." },
];

const stats = [
  { value: "12,000+", label: "Verified reviews published", icon: "ri-chat-3-line" },
  { value: "3,500+", label: "UK training providers listed", icon: "ri-building-4-line" },
  { value: "40,000+", label: "Apprentices & employers helped", icon: "ri-group-line" },
  { value: "100%", label: "Independent & self-funded", icon: "ri-shield-check-line" },
];

const milestones = [
  { year: "2021", title: "The idea", description: "Frustrated by how hard it was to find genuine feedback on apprenticeship providers, we started sketching what a fair, independent review platform could look like." },
  { year: "2022", title: "First reviews", description: "We launched with a small group of early reviewers and built our identity verification and moderation process from the ground up." },
  { year: "2023", title: "Public data & scoring", description: "We integrated Ofsted, government and achievement data, turning scattered information into a single transparent score." },
  { year: "2024", title: "Growing community", description: "Thousands of apprentices and employers now use the platform every month to make confident decisions." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/c48fd67eb7fb4d3d8ee0b39bb8f6ee2c.png"
            alt="Abstract warm artwork representing the apprenticeship community"
            title="ApprenticeshipsReviews community"
            width={467}
            height={313}
            className="site-image-hero"
          />
        </div>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative w-full px-4 md:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <AnimateOnScroll direction="up">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-background-50/10 backdrop-blur border border-background-50/20 rounded-full text-white text-sm font-medium">
                <i className="ri-shield-star-line text-accent-500" />
                Independent UK review platform
              </span>
              <h1 className="mt-6 font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Helping apprentices make{" "}
                <span className="text-accent-500">better-informed decisions</span>
              </h1>
              <p className="mt-5 text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                ApprenticeshipsReviews is an independent review platform built for the UK apprenticeship
                community. Our mission is simple: bring transparent, genuine feedback to the world of
                apprenticeship training so every apprentice and employer can choose with confidence.
              </p>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="w-full bg-background-50 border-b border-background-200/70">
        <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((s) => (
              <AnimateOnScroll key={s.label} direction="up" delay={0} className="h-full">
                <div className="flex items-start gap-3 h-full p-4 md:p-5 bg-background-100 rounded-xl border border-background-200/70">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600 shrink-0">
                    <i className={`${s.icon} text-lg`} />
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-foreground-950 font-heading">{s.value}</p>
                    <p className="mt-1 text-xs md:text-sm text-foreground-600">{s.label}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll direction="left">
              <div className="relative overflow-hidden rounded-2xl border border-background-200/70">
                <div className="aspect-[821/325] w-full">
                  <img
                    src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/7289fb622bb442f7a9599033ab74fc34.png"
                    alt="Abstract illustration of apprentices and employers collaborating"
                    title="ApprenticeshipsReviews community collaboration"
                    width={821}
                    height={325}
                    className="site-image-cover"
                  />
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll direction="right">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950 mb-4">
                  Why we exist
                </h2>
                <p className="text-sm md:text-base text-foreground-600 leading-relaxed mb-4">
                  Choosing an apprenticeship provider is one of the most important decisions a young person
                  or employer can make, yet most people do it with very little information. Providers look
                  similar on paper, marketing claims are hard to verify, and genuine feedback is scattered
                  or hard to find.
                </p>
                <p className="text-sm md:text-base text-foreground-600 leading-relaxed">
                  We built ApprenticeshipsReviews to fix that. By collecting verified reviews from apprentices
                  and employers, combining them with public data, and making it all easy to compare, we give
                  the apprenticeship community the clarity it deserves.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {["Independent", "Verified", "Transparent", "Fair"].map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-secondary-100 text-secondary-900 text-xs font-medium rounded-full">
                      <i className="ri-check-line" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">Our values</h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-xl mx-auto">
                These principles guide every decision we make.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {values.map((v) => (
                <AnimateOnScroll key={v.title} direction="up" delay={0}>
                  <div className="p-6 bg-background-50 rounded-xl border border-background-200/70">
                    <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-primary-50 text-primary-600 mb-4">
                      <i className={`${v.icon} text-xl`} />
                    </div>
                    <h3 className="font-heading text-base font-semibold text-foreground-900 mb-2">{v.title}</h3>
                    <p className="text-sm text-foreground-600 leading-relaxed">{v.description}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story / timeline */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">Our story</h2>
              <p className="mt-2 text-foreground-600 text-sm md:text-base max-w-xl mx-auto">
                From a simple idea to a platform used by thousands across the UK.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-0">
                {milestones.map((m, i) => (
                  <AnimateOnScroll key={m.year} direction="up" delay={0}>
                    <div className={`relative pl-8 pb-10 border-l-2 ${i === milestones.length - 1 ? "border-transparent" : "border-accent-300"}`}>
                      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-accent-500 ring-4 ring-background-50" />
                      <span className="inline-block px-2.5 py-1 bg-accent-100 text-accent-900 text-xs font-bold rounded-md mb-2">{m.year}</span>
                      <h3 className="font-heading text-base font-semibold text-foreground-900 mb-1">{m.title}</h3>
                      <p className="text-sm text-foreground-600 leading-relaxed">{m.description}</p>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>

              <AnimateOnScroll direction="right">
                <div className="relative overflow-hidden rounded-2xl border border-background-200/70 sticky top-24">
                  <div className="aspect-[822/478] w-full">
                    <img
                      src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/c4781afb684442319f89a98947780f95.png"
                      alt="Abstract illustration of growth and progress"
                      title="ApprenticeshipsReviews journey"
                      width={822}
                      height={478}
                      className="site-image-cover"
                    />
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="w-full bg-background-100">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground-950">How the platform works</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {principles.map((p, i) => (
                <AnimateOnScroll key={p.title} direction="up" delay={0}>
                  <div className="p-6 bg-background-50 rounded-xl border border-background-200/70">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <i className={`${p.icon} text-base`} />
                      </div>
                      <span className="text-xs font-bold text-primary-600">0{i + 1}</span>
                    </div>
                    <h3 className="font-heading text-sm font-semibold text-foreground-900 mb-2">{p.title}</h3>
                    <p className="text-sm text-foreground-600 leading-relaxed">{p.description}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative w-full bg-primary-600 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/60bc4d1d155345738ce2f2540307cba9.png"
            alt=""
            aria-hidden="true"
            width={448}
            height={328}
            className="site-image-bg"
          />
        </div>
        <div className="relative w-full px-4 md:px-6 lg:px-8 py-14 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
              Join the community
            </h2>
            <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Share your experience or find the right provider — either way, you're helping make apprenticeship choices better for everyone.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/add-review" className="btn btn-lg btn-inverse w-full sm:w-auto">
                Write a Review
              </Link>
              <Link to="/providers" className="btn btn-lg btn-glass w-full sm:w-auto">
                Find a Provider
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
