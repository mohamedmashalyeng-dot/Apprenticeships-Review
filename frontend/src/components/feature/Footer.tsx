import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const exploreLinks = [
  { label: "Find providers", href: "/providers" },
  { label: "Compare providers", href: "/compare" },
  { label: "Reviews", href: "/reviews" },
];

const serviceLinks = [
  { label: "How it works", href: "/methodology" },
  { label: "Data sources", href: "/data-sources" },
  { label: "Ownership and funding", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const policyLinks = [
  { label: "Review policy", href: "/review-policy" },
  { label: "Privacy notice", href: "/privacy-policy" },
  { label: "Terms of use", href: "/terms" },
];

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Link
        to="/add-review"
        aria-label="Write a review"
        title="Write a review"
        className="fixed bottom-40 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-primary-500 text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-primary-600"
      >
        <i className="ri-pencil-line text-lg" />
      </Link>

      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-6 left-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-primary-500 text-white transition-all duration-300 hover:bg-primary-600 ${
          showScrollTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <i className="ri-arrow-up-line text-lg" />
      </button>

      <footer className="w-full overflow-hidden bg-[#05122b]">
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 pb-10 pt-14 md:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
              <div>
                <Link to="/home" className="mb-4 inline-flex w-fit items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white">
                    <i className="ri-star-fill text-base" />
                  </div>
                  <span className="font-heading text-lg font-bold tracking-tight text-white">
                    Apprenticeships <span className="text-primary-400">Reviews</span>
                  </span>
                </Link>
                <p className="max-w-md text-sm leading-relaxed text-white/65">
                  Apprenticeships Reviews helps apprentices and employers explore training providers, review feedback and published provider information.
                </p>
                <p className="mt-4 max-w-md text-xs leading-relaxed text-white/45">
                  Ownership disclosure should be confirmed before publication. If Kent Business College Ltd is the operator, state that relationship clearly on the linked ownership page.
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-3">
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/45">Explore</h4>
                  <ul className="flex flex-col gap-2">
                    {exploreLinks.map((link) => (
                      <li key={link.href}>
                        <Link to={link.href} className="text-sm text-white/70 transition-colors duration-200 hover:text-primary-400">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/45">About the service</h4>
                  <ul className="flex flex-col gap-2">
                    {serviceLinks.map((link) => (
                      <li key={link.href}>
                        <Link to={link.href} className="text-sm text-white/70 transition-colors duration-200 hover:text-primary-400">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/45">Policies</h4>
                  <ul className="flex flex-col gap-2">
                    {policyLinks.map((link) => (
                      <li key={link.href}>
                        <Link to={link.href} className="text-sm text-white/70 transition-colors duration-200 hover:text-primary-400">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-4 py-5 md:px-6 lg:px-8">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} Apprenticeships Reviews</p>
              <div className="flex items-center gap-5">
                <Link to="/privacy-policy" className="text-xs text-white/40 transition-colors hover:text-white">
                  Privacy
                </Link>
                <Link to="/terms" className="text-xs text-white/40 transition-colors hover:text-white">
                  Terms
                </Link>
                <Link to="/review-policy" className="text-xs text-white/40 transition-colors hover:text-white">
                  Review policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
