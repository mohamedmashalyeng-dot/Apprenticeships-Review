import { Link } from "react-router-dom";
import AnimateOnScroll from "@/components/feature/AnimateOnScroll";

export default function AboutSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background-50">
      <div className="w-full px-4 py-14 md:px-6 md:py-20 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <AnimateOnScroll direction="left">
            <div className="relative overflow-hidden rounded-2xl border border-background-200/70">
              <div className="h-[300px] w-full md:h-[420px]">
                <img
                  src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/5b93059c10cf4de5b8e51447636fc3f9.png"
                  alt=""
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll direction="right">
            <div>
              <h2 className="mb-4 font-heading text-2xl font-bold text-foreground-950 md:text-3xl">Why we exist</h2>
              <p className="mb-4 text-sm leading-relaxed text-foreground-600 md:text-base">
                Choosing an apprenticeship training provider can be difficult when course information, reviews and inspection findings are spread across different websites. Apprenticeships Reviews brings available information together to help apprentices, career changers and employers compare their options and decide what to ask next.
              </p>
              <p className="text-sm leading-relaxed text-foreground-600 md:text-base">
                Review opinions and published performance data tell different parts of the story. Check their source and date, consider what matters to you, and speak to the provider before making a decision.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {["Review source shown", "Published data separated", "No-review state labelled", "Comparison shortlist"].map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 rounded-lg bg-secondary-100 px-3.5 py-1.5 text-xs font-medium text-secondary-900">
                    <i className="ri-check-line" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
                <Link
                  to="/methodology"
                  className="inline-flex items-center gap-1 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  How the comparison works
                  <i className="ri-arrow-right-line" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1 rounded-lg bg-background-100 px-5 py-2.5 text-sm font-medium text-foreground-700 transition-colors hover:bg-background-200"
                >
                  Who operates this site
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
