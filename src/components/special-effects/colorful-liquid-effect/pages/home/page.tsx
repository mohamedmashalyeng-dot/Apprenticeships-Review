import SmokeShader from "./components/SmokeShader";
import Navbar from "./components/Navbar";

const SHOW_NAVBAR = false;

const stats = [
  { value: "120K+", label: "Creators shipping daily" },
  { value: "4.9/5", label: "Average review on Producthunt" },
  { value: "<16ms", label: "Real-time render latency" },
];

export default function Home() {
  return (
    <div
      className="relative bg-white text-neutral-900 min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {SHOW_NAVBAR ? <Navbar /> : null}

      {/* Hero */}
      <section className="relative h-screen min-h-[720px] w-full overflow-hidden bg-white">
        {/* Smoke shader background */}
        <SmokeShader
          scale={2.2}
          speed={0.1}
          density={0.6}
          softness={0.3}
          color1={[0.0, 0.8, 0.9]}
          color2={[0.8, 0.2, 0.9]}
          color3={[1.0, 0.8, 0.0]}
          bgColor={[1.0, 1.0, 1.0]}
        />

        {/* Soft white vignette to keep edges clean and text legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-white/40 pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center text-center px-6 md:px-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-200 bg-white/70 backdrop-blur-md mb-8">
            <span className="w-2 h-2 flex items-center justify-center rounded-full bg-[#cc33e6] animate-pulse"></span>
            <span className="text-xs tracking-wider uppercase text-neutral-700">
              v4.0 · Real-time creative engine
            </span>
          </div>

          <h1
            className="text-5xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tight max-w-5xl text-neutral-900"
            style={{ fontFamily: "'Fraunces', 'Times New Roman', serif", fontWeight: 400, letterSpacing: "-0.04em" }}
          >
            Where ideas
            <br />
            <span
              className="italic bg-gradient-to-r from-[#00cce6] via-[#cc33e6] to-[#ffcc00] bg-clip-text text-transparent"
              style={{ fontWeight: 300 }}
            >
              catch fire.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base md:text-lg text-neutral-600 leading-relaxed">
            Ember is the real-time canvas where designers, founders and storytellers
            shape interactive worlds. Drag your mouse — the smoke follows.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
            <a
              href="#start"
              className="group flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all cursor-pointer whitespace-nowrap"
            >
              Start creating — it&apos;s free
              <i className="ri-arrow-right-line group-hover:translate-x-0.5 transition-transform"></i>
            </a>
            <a
              href="#demo"
              className="flex items-center gap-2 border border-neutral-300 bg-white/70 backdrop-blur-md text-neutral-900 px-6 py-3 rounded-full text-sm font-medium hover:bg-white transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-play-circle-line text-lg"></i>
              Watch the 90s demo
            </a>
          </div>

          <p className="mt-6 text-xs text-neutral-500 tracking-wider uppercase flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <i className="ri-cursor-line text-[#00aec4]"></i> Move to emit smoke
            </span>
            <span className="text-neutral-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <i className="ri-radio-button-line text-[#cc33e6]"></i> Click to ignite a shockwave
            </span>
          </p>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-500">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-neutral-400 to-transparent"></div>
        </div>

        {/* Stats strip */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-neutral-200 bg-white/80 backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`px-6 py-5 flex items-center gap-4 ${
                  i !== 0 ? "md:border-l border-neutral-200" : ""
                }`}
              >
                <div
                  className="text-2xl md:text-3xl text-neutral-900"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, letterSpacing: "-0.02em" }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-neutral-600 leading-snug">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filler section so the hero feels anchored */}
      <section className="relative bg-white py-24 px-6 md:px-12 border-t border-neutral-200">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          {[
            {
              icon: "ri-magic-line",
              title: "Generative motion",
              text: "Procedural shaders that respond to every move you make.",
              tint: "from-[#00cce6]/15 to-[#00cce6]/5",
              ring: "border-[#00cce6]/40",
              iconColor: "text-[#00aec4]",
            },
            {
              icon: "ri-stack-line",
              title: "Layered worlds",
              text: "Stack effects, lights and characters in one fluid timeline.",
              tint: "from-[#cc33e6]/15 to-[#cc33e6]/5",
              ring: "border-[#cc33e6]/40",
              iconColor: "text-[#b022c9]",
            },
            {
              icon: "ri-share-forward-line",
              title: "Ship anywhere",
              text: "Export to web, video or interactive embeds in one click.",
              tint: "from-[#ffcc00]/20 to-[#ffcc00]/5",
              ring: "border-[#ffcc00]/50",
              iconColor: "text-[#c99a00]",
            },
          ].map((f) => (
            <div
              key={f.title}
              className={`border border-neutral-200 rounded-xl p-6 hover:${f.ring} transition-colors bg-white`}
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-md bg-gradient-to-br ${f.tint} border ${f.ring} mb-4`}
              >
                <i className={`${f.icon} ${f.iconColor} text-xl`}></i>
              </div>
              <h3 className="text-lg font-medium mb-2 text-neutral-900">{f.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
