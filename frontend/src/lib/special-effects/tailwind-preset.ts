/** Shared Tailwind preset for @readdy/special-effects heroes. */

const oklchScale = (name: string) => ({
  50: `oklch(var(--${name}-50) / <alpha-value>)`,
  100: `oklch(var(--${name}-100) / <alpha-value>)`,
  200: `oklch(var(--${name}-200) / <alpha-value>)`,
  300: `oklch(var(--${name}-300) / <alpha-value>)`,
  400: `oklch(var(--${name}-400) / <alpha-value>)`,
  500: `oklch(var(--${name}-500) / <alpha-value>)`,
  600: `oklch(var(--${name}-600) / <alpha-value>)`,
  700: `oklch(var(--${name}-700) / <alpha-value>)`,
  800: `oklch(var(--${name}-800) / <alpha-value>)`,
  900: `oklch(var(--${name}-900) / <alpha-value>)`,
  950: `oklch(var(--${name}-950) / <alpha-value>)`,
});

const preset = {
  darkMode: "class" as const,
  theme: {
    extend: {
      colors: {
        background: oklchScale("background"),
        foreground: oklchScale("foreground"),
        primary: oklchScale("primary"),
        accent: oklchScale("accent"),
        secondary: oklchScale("secondary"),
        brand: {
          blue: "#1A2BFF",
          red: "#FF2A2A",
        },
        // Interactive cartoon book / portfolio header tokens
        cream: {
          DEFAULT: "#F5F0E8",
          50: "#FBF8F3",
          100: "#F5F0E8",
        },
        forest: {
          DEFAULT: "#1A3A2A",
          900: "#0F2419",
        },
        ink: {
          DEFAULT: "#0A0A0A",
          50: "#F5F5F5",
          900: "#0A0A0A",
        },
      },
      fontFamily: {
        sans: ["Archivo", "var(--font-body)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        display: ["Archivo", "var(--font-heading)", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "serif"],
        label: ["var(--font-label)", "var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        funnel: ["Funnel Display", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default preset;
