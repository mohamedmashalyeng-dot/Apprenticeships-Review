import { Link } from "react-router-dom";

export default function CalloutBanner() {
  return (
    <section className="w-full relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/1c1703ae55514886acc5d4c542c7cdd2.png"
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
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-2xl bg-accent-500 text-white">
                <i className="ri-scales-3-line text-2xl" />
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-heading text-xl md:text-2xl font-bold text-white">
                Compare providers. Make an informed choice.
              </h3>
              <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed max-w-xl">
                Bring your shortlist together, review available information side by side and check the source behind each rating or published data point.
              </p>
            </div>

            {/* Button */}
            <div className="flex items-center gap-6 flex-shrink-0">
              <Link
                to="/compare"
                className="px-7 py-3.5 bg-white text-black text-sm font-bold rounded-full hover:bg-white/90 transition-colors whitespace-nowrap shadow-lg shadow-black/20"
              >
                Compare providers
                <i className="ri-arrow-right-line ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
