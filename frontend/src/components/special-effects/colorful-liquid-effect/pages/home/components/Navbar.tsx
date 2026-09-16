import { useEffect, useState } from "react";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Showcase", href: "#showcase" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-xl border-b border-neutral-200" : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-12 h-16">
        <a href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gradient-to-br from-[#00cce6] via-[#cc33e6] to-[#ffcc00]">
            <i className="ri-flashlight-line text-white text-lg"></i>
          </div>
          <span
            className="text-xl tracking-tight text-neutral-900"
            style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            ember
          </span>
        </a>
    
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </div>
    
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#signin"
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer whitespace-nowrap"
          >
            Sign in
          </a>
          <a
            href="#start"
            className="text-sm bg-neutral-900 text-white px-4 py-2 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            Get started
            <i className="ri-arrow-right-up-line"></i>
          </a>
        </div>
    
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-neutral-900 cursor-pointer"
          aria-label="Open menu"
        >
          <i className={`${menuOpen ? "ri-close-line" : "ri-menu-line"} text-2xl`}></i>
        </button>
      </div>
    
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-neutral-200 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-neutral-700 hover:text-neutral-900 cursor-pointer"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="h-px bg-neutral-200 my-1"></div>
          <a href="#signin" className="text-sm text-neutral-700 cursor-pointer">
            Sign in
          </a>
          <a
            href="#start"
            className="text-sm bg-neutral-900 text-white px-4 py-2 rounded-md text-center cursor-pointer whitespace-nowrap"
          >
            Get started
          </a>
        </div>
      )}
    </nav>
  );
}
