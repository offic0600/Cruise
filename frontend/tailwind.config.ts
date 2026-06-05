import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "var(--color-brand-500)",
          600: "var(--color-brand-600)",
        },
        surface: {
          page: "var(--bg-canvas)",
          pageMid: "var(--bg-canvas-muted)",
          raised: "var(--bg-surface)",
          glass: "var(--bg-surface)",
          soft: "var(--bg-subtle)",
          overlay: "var(--bg-overlay)",
        },
        border: {
          subtle: "var(--border-subtle)",
          soft: "var(--border-default)",
        },
        ink: {
          900: "var(--fg-primary)",
          700: "var(--fg-secondary)",
          400: "var(--fg-tertiary)",
          300: "var(--border-strong)",
        },
        canvas: "var(--bg-canvas)",
        "canvas-muted": "var(--bg-canvas-muted)",
        "surface-elevated": "var(--bg-elevated)",
        "fg-primary": "var(--fg-primary)",
        "fg-secondary": "var(--fg-secondary)",
        "fg-tertiary": "var(--fg-tertiary)",
        "fg-disabled": "var(--fg-disabled)",
        "fg-brand": "var(--fg-brand)",
      },
      borderRadius: {
        control: "var(--radius-lg)",
        card: "var(--radius-2xl)",
        panel: "var(--radius-3xl)",
        pill: "var(--radius-full)",
      },
      boxShadow: {
        card: "var(--shadow-sm)",
        nav: "var(--shadow-lg)",
        brand: "0 16px 36px rgba(21, 94, 239, 0.22)",
        elevated: "var(--shadow-xl)",
      },
      backdropBlur: {
        glass: "20px",
      },
      backgroundImage: {
        "page-glow": "var(--bg-page-glow)",
        "brand-gradient": "linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))",
      },
    },
  },
  plugins: [],
};

export default config;
