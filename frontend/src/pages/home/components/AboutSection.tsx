import { Link } from "react-router-dom";
import AnimateOnScroll from "@/components/feature/AnimateOnScroll";

export default function AboutSection() {
  return (
    <section className="relative w-full bg-background-50 overflow-hidden">
      <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimateOnScroll direction="left">
            <div className="relative overflow-hidden rounded-2xl border border-background-200/70">
              <div className="w-full h-[300px] md:h-[420px]">
                <img
                  src="https://readdy.ai/api/search-image?query=Two%20colleagues%20collaborating%20closely%20at%20a%20desk%20reviewing%20notes%20and%20charts%20together%20in%20a%20warm%20modern%20workspace%2C%20natural%20window%20light%2C%20soft%20beige%20and%20amber%20tones%20with%20muted%20teal%20accents%2C%20genuine%20teamwork%20and%20connection%2C%20editorial%20portrait%20photography%2C%20high%20detail%2C%20realistic%20professional%20atmosphere&width=900&height=1000&seq=home-about-mission-01&orientation=portrait&nocache=true"
                  alt="Abstract illustration of apprentices and employers collaborating"
                  className="w-full h-full object-cover object-top"
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
              <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1 px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors whitespace-nowrap"
                >
                  Learn more about us
                  <i className="ri-arrow-right-line" />
                </Link>
                <Link
                  to="/methodology"
                  className="inline-flex items-center gap-1 px-5 py-2.5 bg-background-100 text-foreground-700 text-sm font-medium rounded-full hover:bg-background-200 transition-colors whitespace-nowrap"
                >
                  How we score providers
                  <i className="ri-arrow-right-line" />
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}