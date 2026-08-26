import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

const exploreLinks = [
  { label: "Find a Provider", href: "/providers" },
  { label: "Categories", href: "/categories" },
  { label: "Top Rated", href: "/top-rated" },
  { label: "Compare", href: "/compare" },
];

const reviewLinks = [
  { label: "Write a Review", href: "/add-review" },
  { label: "Recent Reviews", href: "/reviews" },
  { label: "Review Guidelines", href: "/review-policy" },
];

const companyLinks = [
  { label: "About us", href: "/about" },
  { label: "Methodology", href: "/methodology" },
  { label: "Data sources", href: "/data-sources" },
  { label: "Contact", href: "/contact" },
];

const footerSocials = [
  { icon: "ri-facebook-fill", label: "Facebook" },
  { icon: "ri-twitter-x-fill", label: "Twitter" },
  { icon: "ri-linkedin-fill", label: "LinkedIn" },
  { icon: "ri-instagram-fill", label: "Instagram" },
];

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="fixed bottom-20 right-6 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-background-100 text-foreground-700 border border-background-200 shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:bg-background-200 transition-all duration-300 cursor-pointer"
      >
        <i className={`text-lg ${theme === "dark" ? "ri-sun-line" : "ri-moon-line"}`} />
      </button>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-all duration-300 cursor-pointer ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <i className="ri-arrow-up-line text-lg" />
      </button>

      <footer className="w-full bg-background-50 relative overflow-hidden">
        {/* Soft professional shadow rising upward */}
        <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-background-200/40 via-background-200/15 to-transparent" />

        {/* Highlight circles / glowing orbs at the bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <div
            className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[520px] h-[240px] rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, oklch(var(--primary-400) / 0.14) 0%, oklch(var(--primary-300) / 0.06) 45%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />
          <div
            className="absolute -bottom-16 -left-20 w-[320px] h-[200px] rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, oklch(var(--accent-400) / 0.1) 0%, transparent 65%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute -bottom-16 -right-20 w-[320px] h-[200px] rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, oklch(var(--secondary-400) / 0.1) 0%, transparent 65%)",
              filter: "blur(60px)",
            }}
          />
        </div>

        <div className="border-t border-background-200">
          <div className="relative max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-14 pb-10">
            <div className="flex flex-col items-center text-center">
              {/* Logo */}
              <Link to="/home" className="inline-flex items-center gap-2.5 mb-3 w-fit">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-500 text-white">
                  <i className="ri-star-fill text-base" />
                </div>
                <span className="font-heading text-lg font-bold tracking-tight text-foreground-900">
                  Apprenticeships <span className="text-primary-500">Reviews</span>
                </span>
              </Link>

              <p className="text-sm text-foreground-500 max-w-sm leading-relaxed mb-8">
                Independent reviews and ratings for UK apprenticeship providers. Trusted by thousands of learners and employers.
              </p>

              {/* Page links */}
              <div className="grid grid-cols-3 gap-x-10 gap-y-8 w-full max-w-2xl">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-400 mb-3">Explore</h4>
                  <ul className="flex flex-col gap-2">
                    {exploreLinks.map((link) => (
                      <li key={link.href}>
                        <Link to={link.href} className="text-sm text-foreground-600 hover:text-primary-500 transition-colors duration-200">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-400 mb-3">Reviews</h4>
                  <ul className="flex flex-col gap-2">
                    {reviewLinks.map((link) => (
                      <li key={link.href}>
                        <Link to={link.href} className="text-sm text-foreground-600 hover:text-primary-500 transition-colors duration-200">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-400 mb-3">Company</h4>
                  <ul className="flex flex-col gap-2">
                    {companyLinks.map((link) => (
                      <li key={link.href}>
                        <Link to={link.href} className="text-sm text-foreground-600 hover:text-primary-500 transition-colors duration-200">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Social icons below links */}
              <div className="flex items-center gap-3 mt-10">
                {footerSocials.map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    aria-label={social.label}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-background-100 text-foreground-400 hover:text-primary-500 hover:bg-primary-50 transition-colors duration-200"
                  >
                    <i className={`${social.icon} text-sm`} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="relative border-t border-background-200 px-4 md:px-6 lg:px-8 py-5">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
              <p className="text-xs text-foreground-400">
                &copy; {new Date().getFullYear()} ApprenticeshipsReviews
              </p>
              <div className="flex items-center gap-5">
                <Link to="/privacy-policy" className="text-xs text-foreground-400 hover:text-foreground-700 transition-colors">Privacy</Link>
                <Link to="/terms" className="text-xs text-foreground-400 hover:text-foreground-700 transition-colors">Terms</Link>
                <Link to="/review-policy" className="text-xs text-foreground-400 hover:text-foreground-700 transition-colors">Guidelines</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}