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
          500: "#06b6d4",
          600: "#2563eb",
        },
        surface: {
          page: "#f8fafc",
          pageMid: "#eef6ff",
          raised: "rgba(255,255,255,0.9)",
          glass: "rgba(255,255,255,0.85)",
          soft: "rgba(248,250,252,0.8)",
          overlay: "rgba(2,6,23,0.3)",
        },
        border: {
          subtle: "rgba(226,232,240,0.7)",
          soft: "#e2e8f0",
        },
        ink: {
          900: "#0f172a",
          700: "#475569",
          400: "#94a3b8",
          300: "#cbd5e1",
        },
      },
      borderRadius: {
        control: "1rem",
        card: "1.5rem",
        panel: "1.75rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04)",
        nav: "0 10px 30px rgba(15,23,42,0.15)",
        brand: "0 10px 30px rgba(37,99,235,0.30)",
        elevated: "0 20px 50px rgba(15,23,42,0.18)",
      },
      backdropBlur: {
        glass: "20px",
      },
      backgroundImage: {
        "page-glow":
          "radial-gradient(circle_at_top_left, rgba(59,130,246,0.14), transparent 28%), radial-gradient(circle_at_bottom_right, rgba(14,165,233,0.12), transparent 26%), linear-gradient(135deg, #f8fafc, #eef6ff 45%, #ffffff)",
        "brand-gradient": "linear-gradient(135deg, #2563eb, #06b6d4)",
      },
    },
  },
  plugins: [],
};

export default config;
