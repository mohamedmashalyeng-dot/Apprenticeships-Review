import { Link } from "react-router-dom";

export default function CalloutBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f3f9ff] dark:bg-[#05122b]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="site-grid-layer absolute inset-0" />
        <div className="site-glow-layer absolute inset-0" />
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full border border-primary-200/55 dark:border-white/10" />
        <div className="absolute right-28 top-8 h-72 w-72 rounded-full border border-primary-200/40 dark:border-white/10" />
      </div>

      <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10 rounded-2xl border border-white/90 bg-white/85 p-6 shadow-[0_24px_60px_rgba(31,112,190,0.12)] backdrop-blur-sm dark:border-white/10 dark:bg-white/10 dark:shadow-[0_24px_60px_rgba(0,0,0,0.24)] md:p-9">
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-500/25">
                <i className="ri-scales-3-line text-2xl" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="font-heading text-xl md:text-2xl font-bold text-[#071b36] dark:text-white">
                Compare providers. Make an informed choice.
              </h3>
              <p className="mt-2 text-sm md:text-base text-[#55708c] leading-relaxed max-w-xl dark:text-white/70">
                Bring your shortlist together, review available information side by side and check the source behind each rating or published data point.
              </p>
            </div>

            <div className="flex items-center gap-6 flex-shrink-0">
              <Link
                to="/compare"
                className="btn btn-lg btn-primary shadow-lg shadow-primary-500/25"
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
