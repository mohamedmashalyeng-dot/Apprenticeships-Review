import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavLink {
  label: string;
  href: string;
  hasDropdown?: boolean;
  dropdownLinks?: { label: string; href: string }[];
}

const mainLinks: NavLink[] = [
  { label: "Home", href: "/home" },
  { label: "Find a Provider", href: "/providers" },
  { label: "Categories", href: "/categories" },
  { label: "Compare", href: "/compare" },
  { label: "Top Rated", href: "/top-rated" },
  {
    label: "For Providers",
    href: "/claim-provider",
    hasDropdown: true,
    dropdownLinks: [
      { label: "Claim your profile", href: "/claim-provider" },
      { label: "Provider Dashboard", href: "/provider-dashboard" },
      { label: "Information for providers", href: "/help" },
    ],
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const location = useLocation();
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileExpanded(null);
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => location.pathname === href;

  const linkClass = (href: string) =>
    `text-sm font-medium whitespace-nowrap transition-all duration-200 px-3 py-1.5 rounded-md ${
      isActive(href)
        ? "text-white bg-background-50/10"
        : "text-white/70 hover:text-white hover:bg-background-50/8"
    }`;

  const handleMouseEnter = (label: string) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const isDropdownOpen = (label: string) => openDropdown === label;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#05122B] shadow-[0_1px_8px_rgba(0,0,0,0.35)]"
          : "bg-[#071B3A]"
      }`}
    >
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link
            to="/home"
            className="flex items-center gap-2 whitespace-nowrap flex-shrink-0"
          >
            <div className="w-7 h-7 flex items-center justify-center rounded-md bg-primary-500 text-white">
              <i className="ri-star-fill text-sm" />
            </div>
            <span className="font-heading text-base md:text-lg font-bold tracking-tight">
              <span className="text-white">Apprenticeships</span>{" "}
              <span className="text-primary-400">Reviews</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {mainLinks.map((link) => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.hasDropdown && handleMouseEnter(link.label)}
                onMouseLeave={link.hasDropdown ? handleMouseLeave : undefined}
              >
                <Link
                  to={link.href}
                  className={`${linkClass(link.href)} flex items-center gap-1`}
                >
                  {link.label}
                  {link.hasDropdown && (
                    <i
                      className={`text-[10px] transition-transform duration-200 ${
                        isDropdownOpen(link.label) ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"
                      }`}
                    />
                  )}
                </Link>

                {/* Dropdown */}
                {link.hasDropdown && link.dropdownLinks && isDropdownOpen(link.label) && (
                  <div
                    className="absolute top-full left-0 mt-1 w-72 py-2 bg-[#0C2547] border border-background-50/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] animate-[fadeIn_150ms_ease-out]"
                    onMouseEnter={() => {
                      if (leaveTimerRef.current) {
                        clearTimeout(leaveTimerRef.current);
                        leaveTimerRef.current = null;
                      }
                    }}
                    onMouseLeave={handleMouseLeave}
                  >
                    {link.dropdownLinks.map((dl) => (
                      <Link
                        key={dl.href}
                        to={dl.href}
                        className={`block px-4 py-3 mx-1.5 rounded-lg transition-all duration-150 ${
                          isActive(dl.href)
                            ? "bg-primary-500/15"
                            : "hover:bg-background-50/8"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            isActive(dl.href) ? "text-primary-300" : "text-white"
                          }`}
                        >
                          {dl.label}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm text-white/70 hover:text-white transition-colors whitespace-nowrap"
            >
              Log in
            </Link>
            <Link
              to="/add-review"
              className="px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors duration-200 whitespace-nowrap"
            >
              Write a Review
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <i className={`text-xl ${mobileOpen ? "ri-close-line" : "ri-menu-line"}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-background-50/10 bg-[#071B3A]">
          <div className="px-4 py-4 flex flex-col gap-1">
            {mainLinks.map((link) => (
              <div key={link.href}>
                {link.hasDropdown ? (
                  <>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === link.label ? null : link.label)}
                      className="w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between text-white/70 hover:bg-background-50/5"
                    >
                      <span>{link.label}</span>
                      <i
                        className={`text-xs transition-transform duration-200 ${
                          mobileExpanded === link.label ? "ri-arrow-up-s-line rotate-0" : "ri-arrow-down-s-line"
                        }`}
                      />
                    </button>
                    {mobileExpanded === link.label && link.dropdownLinks && (
                      <div className="ml-3 mt-1 mb-1 flex flex-col gap-0.5 border-l border-background-50/10 pl-3">
                        {link.dropdownLinks.map((dl) => (
                          <Link
                            key={dl.href}
                            to={dl.href}
                            className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                              isActive(dl.href)
                                ? "bg-primary-500/15 text-primary-300 font-medium"
                                : "text-white/70 hover:bg-background-50/5"
                            }`}
                            onClick={() => setMobileOpen(false)}
                          >
                            {dl.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={link.href}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors block ${
                      isActive(link.href)
                        ? "bg-primary-500/20 text-primary-300"
                        : "text-white/70 hover:bg-background-50/5"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            <Link
              to="/login"
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-background-50/5 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>
            <Link
              to="/add-review"
              className="mt-2 px-4 py-3 bg-primary-500 text-white text-sm font-semibold rounded-full text-center hover:bg-primary-600 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Write a Review
            </Link>
          </div>
        </div>
      )}

      {/* Dropdown fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
}