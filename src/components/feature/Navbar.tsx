import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getNotifications } from "@/services/notifications.service";

interface NavLink {
  label: string;
  href: string;
  hasDropdown?: boolean;
  dropdownLinks?: { label: string; href: string }[];
}

const mainLinks: NavLink[] = [
  { label: "Home", href: "/home" },
  { label: "Find a Provider", href: "/providers" },
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    getNotifications()
      .then((notifs) => setUnreadCount(notifs.filter((n) => !n.is_read).length))
      .catch(() => {});
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/home");
  };

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
    setProfileMenuOpen(false);
  }, [location.pathname]);

  // Close profile menu on outside click
  useEffect(() => {
    if (!profileMenuOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [profileMenuOpen]);

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
            {user ? (
              <>
                <Link
                  to="/dashboard?tab=notifications"
                  className="relative flex items-center text-white/70 hover:text-white transition-colors"
                  aria-label="Notifications"
                >
                  <i className="ri-notification-3-line text-lg" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-primary-500 text-white text-[10px] font-semibold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                {(user.role === "admin" || user.role === "moderator") && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary-300 hover:text-primary-200 transition-colors whitespace-nowrap px-3 py-1.5 rounded-full bg-primary-500/10 hover:bg-primary-500/15"
                  >
                    <i className="ri-shield-user-line text-sm" />
                    Admin panel
                  </Link>
                )}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileMenuOpen((open) => !open)}
                    className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-user-3-line text-base" />
                    Profile
                    <i className={`text-[10px] transition-transform duration-200 ${profileMenuOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`} />
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-[#0C2547] border border-background-50/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] animate-[fadeIn_150ms_ease-out]">
                      <div className="px-4 py-2.5 border-b border-background-50/10">
                        <p className="text-xs text-white/50">Signed in as</p>
                        <p className="text-sm text-white font-medium truncate">{user.displayName || user.email}</p>
                      </div>
                      <Link
                        to={user.role === "company_owner" ? "/provider-dashboard" : "/dashboard"}
                        className="flex items-center gap-2 px-4 py-2.5 mx-1.5 mt-1 rounded-lg text-sm text-white/80 hover:bg-background-50/8 hover:text-white transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <i className="ri-dashboard-line text-sm" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 mx-1.5 rounded-lg text-sm text-white/80 hover:bg-background-50/8 hover:text-white transition-colors cursor-pointer"
                      >
                        <i className="ri-logout-box-line text-sm" />
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm text-white/70 hover:text-white transition-colors whitespace-nowrap"
              >
                Log in
              </Link>
            )}
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
            {user ? (
              <>
                <Link
                  to="/dashboard?tab=notifications"
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-background-50/5 transition-colors flex items-center gap-1.5"
                  onClick={() => setMobileOpen(false)}
                >
                  <i className="ri-notification-3-line text-sm" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary-500 text-white text-[10px] font-semibold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                {(user.role === "admin" || user.role === "moderator") && (
                  <Link
                    to="/admin"
                    className="px-3 py-2.5 rounded-lg text-sm font-semibold text-primary-300 hover:bg-background-50/5 transition-colors flex items-center gap-1.5"
                    onClick={() => setMobileOpen(false)}
                  >
                    <i className="ri-shield-user-line text-sm" />
                    Admin panel
                  </Link>
                )}
                <Link
                  to={user.role === "company_owner" ? "/provider-dashboard" : "/dashboard"}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-background-50/5 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {user.displayName || user.email}
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-background-50/5 transition-colors text-left cursor-pointer"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-background-50/5 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
            )}
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