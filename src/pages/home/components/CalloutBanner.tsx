import { Link } from "react-router-dom";

export default function CalloutBanner() {
  return (
    <section className="w-full relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://readdy.ai/api/search-image?query=Two%20professionals%20comparing%20documents%20and%20data%20charts%20side%20by%20side%20on%20a%20wooden%20table%20in%20a%20warm%20modern%20office%2C%20one%20pointing%20at%20a%20screen%20showing%20comparison%20graphs%2C%20natural%20window%20light%2C%20soft%20beige%20and%20amber%20tones%20with%20muted%20teal%20accents%2C%20editorial%20photography%2C%20realistic%20professional%20atmosphere%20with%20soft%20depth%20of%20field%20and%20clean%20composition&width=1600&height=700&seq=callout-compare-01&orientation=landscape"
          alt="Professionals comparing apprenticeship providers side by side"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      </div>

      <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10 rounded-2xl bg-background-50/5 backdrop-blur-sm border border-background-50/15 p-6 md:p-9">
            {/* Icon */}
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-2xl bg-accent-500 text-black">
              <i className="ri-shield-check-line text-2xl" />
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-heading text-xl md:text-2xl font-bold text-white">
                Compare providers. Make the right choice.
              </h3>
              <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed max-w-xl">
                Side-by-side comparisons, transparent scoring and verified reviews help you choose the best provider for your goals.
              </p>
            </div>

            {/* Button */}
            <div className="flex items-center gap-6 flex-shrink-0">
              <Link
                to="/compare"
                className="px-7 py-3.5 bg-accent-500 text-black text-sm font-bold rounded-full hover:bg-accent-400 transition-colors whitespace-nowrap shadow-lg shadow-accent-500/20"
              >
                Start comparing providers
                <i className="ri-arrow-right-line ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}