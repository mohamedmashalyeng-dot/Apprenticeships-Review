import { Link } from "react-router-dom";

export default function BottomCTA() {
  return (
    <section className="w-full relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/18ffc658772040df8cb1bc14b3144739.png"
          alt="Young professionals collaborating in a modern workspace"
          className="site-image-bg"
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
              Build your shortlist
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-relaxed mb-5">
            Compare providers.
            <br className="hidden sm:block" />
            <span className="text-accent-400">Make an informed choice.</span>
          </h2>

          {/* Body */}
          <p className="text-base md:text-lg text-white/85 max-w-xl mx-auto leading-relaxed mb-10">
            Bring your shortlist together, explore relevant reviews and compare the information available for each provider.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/compare"
              className="w-full sm:w-auto px-8 py-3.5 bg-accent-500 text-white text-sm font-bold rounded-full hover:bg-accent-600 transition-colors whitespace-nowrap shadow-lg shadow-accent-500/20"
            >
              Compare providers
              <i className="ri-arrow-right-line ml-2" />
            </Link>
            <Link
              to="/reviews"
              className="w-full sm:w-auto px-8 py-3.5 bg-background-50/10 backdrop-blur-sm text-white text-sm font-bold rounded-full border border-background-50/30 hover:bg-background-50/20 transition-colors whitespace-nowrap"
            >
              Read apprenticeship reviews
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2 text-white/50">
              <i className="ri-shield-check-line text-accent-400" />
              <span className="text-sm">Review source and date shown</span>
            </div>
            <div className="flex items-center gap-2 text-white/50">
              <i className="ri-database-2-line text-accent-400" />
              <span className="text-sm">Published provider data separated</span>
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
