import { Link } from "react-router-dom";

export default function WhySection() {
  return (
    <section className="relative w-full bg-primary-50 dark:bg-primary-950/30 overflow-hidden">
      <div className="w-full px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Left card */}
            <div
              className="group relative p-6 md:p-8 bg-background-50 border border-background-200/70 rounded-2xl shadow-[0_1px_8px_rgba(7,27,58,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(7,27,58,0.08)] transition-all duration-300"
              style={{ "--brand": "#0B5CFF" } as React.CSSProperties}
            >
              {/* Hover border beam */}
              <span
                aria-hidden="true"
                className="category-border-beam pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-50 text-primary-500 mb-4">
                <i className="ri-shield-star-line text-2xl" />
              </div>
              <h3 className="font-heading text-lg md:text-xl font-bold text-foreground-900 mb-2">
                Why ApprenticeshipsReviews?
              </h3>
              <p className="text-sm text-foreground-500 leading-relaxed">
                We&rsquo;re the independent review platform for UK apprenticeship providers. Our mission is to bring clarity and confidence to apprenticeship choices.
              </p>
              <Link
                to="/methodology"
                className="btn btn-md btn-secondary mt-5"
              >
                About our mission
              </Link>
            </div>

            {/* Right card */}
            <div
              className="group relative p-6 md:p-8 bg-background-50 border border-background-200/70 rounded-2xl shadow-[0_1px_8px_rgba(7,27,58,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(7,27,58,0.08)] transition-all duration-300"
              style={{ "--brand": "#0891B2" } as React.CSSProperties}
            >
              {/* Hover border beam */}
              <span
                aria-hidden="true"
                className="category-border-beam pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-50 text-primary-500 mb-4">
                <i className="ri-pie-chart-line text-2xl" />
              </div>
              <h3 className="font-heading text-lg md:text-xl font-bold text-foreground-900 mb-2">
                Transparent methodology
              </h3>
              <p className="text-sm text-foreground-500 leading-relaxed">
                Our scores combine learner and employer reviews with public data from Ofsted, government sources and achievement metrics.
              </p>
              <Link
                to="/methodology"
                className="btn btn-md btn-secondary mt-5"
              >
                How we score providers
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Border beam styles */}
      <style>{`
        @property --beam-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        .category-border-beam {
          --border-width: 1.5px;
          padding: var(--border-width);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
        }

        .category-border-beam::before {
          content: "";
          position: absolute;
          inset: -100%;
          background: conic-gradient(
            from var(--beam-angle),
            transparent 0deg,
            var(--brand) 60deg,
            transparent 120deg
          );
          animation: beam-rotate 2.5s linear infinite;
          animation-play-state: paused;
        }

        .group:hover .category-border-beam::before {
          animation-play-state: running;
        }

        @keyframes beam-rotate {
          to {
            --beam-angle: 360deg;
          }
        }
      `}</style>
    </section>
  );
}