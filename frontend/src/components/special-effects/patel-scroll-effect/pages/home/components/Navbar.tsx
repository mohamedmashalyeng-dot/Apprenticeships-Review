import { useState } from "react";

const navItems = ["Home", "About Me", "Projects", "Contact"];

export default function Navbar() {
  const [navHover, setNavHover] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<string>("Home");

  return (
    <>
      <nav
        className="absolute left-1/2 -translate-x-1/2 pointer-events-auto"
        style={{ top: "28px" }}
      >
        <div
          className="flex items-center gap-1 rounded-full border border-black/5 px-2 py-1.5"
          style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          {navItems.map((item) => {
            const isActive = activeNav === item;
            const isHover = navHover === item;
            const opacity = isActive ? 1 : isHover ? 1 : 0.6;
            return (
              <a
                key={item}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNav(item);
                }}
                onMouseEnter={() => setNavHover(item)}
                onMouseLeave={() => setNavHover(null)}
                className={`px-4 py-1.5 text-[13px] tracking-wide whitespace-nowrap rounded-full transition-all duration-300 cursor-pointer ${
                  isActive ? "bg-black text-white" : "text-black"
                }`}
                style={{ opacity }}
              >
                {item}
              </a>
            );
          })}
        </div>
      </nav>

      <button
        type="button"
        className="absolute pointer-events-auto rounded-full bg-white border border-black/10 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
        style={{ top: "28px", right: "32px", width: "44px", height: "44px" }}
        aria-label="Menu"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <i className="ri-apps-2-line text-[18px] text-black/70"></i>
        </div>
      </button>
    </>
  );
}
