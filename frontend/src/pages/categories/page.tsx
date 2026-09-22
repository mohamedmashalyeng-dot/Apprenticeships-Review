import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import LoadingIndicator from "@/components/base/LoadingIndicator";
import { getCategories } from "@/services/categories.service";
import { getCompanies } from "@/services/companies.service";
import type { ApprenticeshipCategory } from "@/types/category";
import type { Provider } from "@/types/provider";

const accentStyles = {
  primary: "bg-primary-50 text-primary-600",
  secondary: "bg-secondary-100 text-secondary-700",
  accent: "bg-accent-100 text-accent-700",
};

export default function Categories() {
  const [categories, setCategories] = useState<ApprenticeshipCategory[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getCompanies()])
      .then(([cats, companies]) => {
        setCategories(cats);
        setProviders(companies);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/19242baa2d6c494eb4d72730fd98a04a.png"
            alt="Abstract background representing apprenticeship categories"
            className="site-image-hero"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
              Apprenticeship categories
            </h1>
            <p className="mt-3 text-sm md:text-base text-white/90 max-w-2xl">
              Browse training providers and reviews by apprenticeship sector. More categories are added as the platform grows.
            </p>
          </div>
        </div>
      </section>

      {/* Categories grid */}
      <section className="w-full bg-background-50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="py-16">
                <LoadingIndicator />
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {categories.map((cat) => {
                const providerCount = providers.filter((p) => p.category_names.includes(cat.name)).length;
                return (
                  <div
                    key={cat.id}
                    className="group relative p-6 bg-background-50 border border-background-200/70 rounded-2xl hover:-translate-y-1 hover:border-primary-200 transition-all duration-300 flex flex-col"
                  >
                    <div className={`w-14 h-14 flex items-center justify-center rounded-2xl mb-4 ${accentStyles[cat.accent]}`}>
                      <i className={`${cat.icon} text-2xl`} />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-foreground-500 leading-relaxed mb-5 flex-1">
                      {cat.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-background-200/60">
                      <span className="text-xs font-medium text-foreground-500">
                        {providerCount > 0
                          ? `${providerCount} provider${providerCount !== 1 ? "s" : ""}`
                          : "Coming soon"}
                      </span>
                      {providerCount > 0 ? (
                        <Link
                          to={`/providers?sector=${encodeURIComponent(cat.name)}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap"
                        >
                          Browse
                          <i className="ri-arrow-right-line text-xs group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      ) : (
                        <span className="text-xs text-foreground-400">No providers yet</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-primary-600">
        <div className="w-full px-4 md:px-6 lg:px-8 py-14 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
              Not sure which category fits you?
            </h2>
            <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Browse all providers or compare a shortlist side by side to find the right training partner for your apprenticeship.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/providers"
                className="w-full sm:w-auto px-8 py-3.5 bg-background-50 text-primary-700 text-sm font-semibold rounded-full hover:bg-background-100 transition-colors whitespace-nowrap"
              >
                Find a Provider
              </Link>
              <Link
                to="/compare"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white text-sm font-semibold rounded-full border border-background-50/30 hover:bg-background-50/10 transition-colors whitespace-nowrap"
              >
                Compare Providers
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}