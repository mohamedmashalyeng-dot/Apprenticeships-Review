import { Link } from "react-router-dom";

export default function BottomCTA() {
  return (
    <section className="w-full relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://readdy.ai/api/search-image?query=Modern%20bright%20co-working%20space%20with%20warm%20sunlight%20streaming%20through%20large%20windows%2C%20young%20professionals%20collaborating%20around%20laptops%2C%20minimal%20interior%20design%2C%20soft%20beige%20and%20cream%20tones%2C%20natural%20wood%20accents%2C%20depth%20of%20field%20blur%20in%20background%2C%20editorial%20photography%20style%2C%20high%20detail%20warm%20atmosphere%2C%20diverse%20team%20working%20together&width=1600&height=700&seq=bottom-cta-bg-2026-01&orientation=landscape"
          alt="Young professionals collaborating in a modern workspace"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/70" />
        {/* Subtle gradient from bottom for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      </div>

      <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center">
          {/* Small label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-background-50/10 backdrop-blur-sm border border-background-50/20 rounded-full mb-6">
            <i className="ri-compass-3-line text-accent-400 text-sm" />
            <span className="text-sm font-medium text-white">
              Your apprenticeship journey starts here
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-relaxed mb-5">
            Find the right provider,
            <br className="hidden sm:block" />
            <span className="text-accent-400">make an informed choice</span>
          </h2>

          {/* Body */}
          <p className="text-base md:text-lg text-white/85 max-w-xl mx-auto leading-relaxed mb-10">
            Compare ratings, reviews, and programme details across every registered apprenticeship provider. No bias, no hidden agenda — just the facts you need to decide.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/compare"
              className="w-full sm:w-auto px-8 py-3.5 bg-accent-500 text-white text-sm font-bold rounded-full hover:bg-accent-600 transition-colors whitespace-nowrap shadow-lg shadow-accent-500/20"
            >
              Compare all providers
              <i className="ri-arrow-right-line ml-2" />
            </Link>
            <Link
              to="/reviews"
              className="w-full sm:w-auto px-8 py-3.5 bg-background-50/10 backdrop-blur-sm text-white text-sm font-bold rounded-full border border-background-50/30 hover:bg-background-50/20 transition-colors whitespace-nowrap"
            >
              Read learner reviews
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2 text-white/50">
              <i className="ri-shield-check-line text-accent-400" />
              <span className="text-sm">Verified reviews</span>
            </div>
            <div className="flex items-center gap-2 text-white/50">
              <i className="ri-database-2-line text-accent-400" />
              <span className="text-sm">Government data sources</span>
            </div>
            <div className="flex items-center gap-2 text-white/50">
              <i className="ri-equalizer-line text-accent-400" />
              <span className="text-sm">Side-by-side comparison</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}