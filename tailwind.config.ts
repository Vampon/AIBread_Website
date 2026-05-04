import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bread: {
          50: "#FFFAEC",
          100: "#FFF1C4",
          200: "#FFE388",
          300: "#FFD75E",
          400: "#FFC52E",
          500: "#F5B70F",
          600: "#D89A00",
          700: "#A87600",
          800: "#3D2817",
          900: "#1F1611",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-noto-sans-sc)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      maxWidth: {
        page: "1400px",
      },
      boxShadow: {
        bread: "0 16px 40px rgba(245, 183, 15, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
