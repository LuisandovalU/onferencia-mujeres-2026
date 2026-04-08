import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        hero: ["var(--font-hero)", "var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },
      maxWidth: {
        container: "96rem",
        "prose-narrow": "40rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      fontSize: {
        "display-hero": [
          "clamp(2.25rem, 7vw, 4.75rem)",
          { lineHeight: "1.02", letterSpacing: "-0.04em" },
        ],
        display: [
          "clamp(1.65rem, 3.2vw, 2.5rem)",
          { lineHeight: "1.1", letterSpacing: "-0.03em" },
        ],
        "display-sm": [
          "clamp(1.2rem, 2.2vw, 1.65rem)",
          { lineHeight: "1.2", letterSpacing: "-0.02em" },
        ],
        body: ["1.0625rem", { lineHeight: "1.65", letterSpacing: "0" }],
        label: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.28em" }],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        forest: "var(--forest)",
        accent: {
          DEFAULT: "var(--accent)",
          muted: "var(--accent-muted)",
        },
        surface: "#ffffff",
      },
      transitionTimingFunction: {
        "in-out-soft": "cubic-bezier(0.42, 0, 0.58, 1)",
      },
      boxShadow: {
        card: "0 1px 0 rgba(0,0,0,0.04), 0 24px 48px -28px rgba(0,0,0,0.12)",
        soft: "0 8px 32px -12px rgba(0,0,0,0.08)",
      },
      keyframes: {
        "leaf-sway": {
          "0%, 100%": { transform: "translate3d(0,0,0) rotate(-2.5deg)" },
          "50%": { transform: "translate3d(0,-7px,0) rotate(2.5deg)" },
        },
        "leaf-sway-reverse": {
          "0%, 100%": { transform: "translate3d(0,0,0) rotate(2deg)" },
          "50%": { transform: "translate3d(0,8px,0) rotate(-2deg)" },
        },
        "leaf-drift": {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-12px,0)" },
        },
      },
      animation: {
        "leaf-sway": "leaf-sway 7s ease-in-out infinite",
        "leaf-sway-reverse": "leaf-sway-reverse 8.5s ease-in-out infinite",
        "leaf-sway-slow": "leaf-sway 9.5s ease-in-out infinite",
        "leaf-drift": "leaf-drift 10s ease-in-out infinite",
      },
    },
  },
  plugins: [
    plugin(({ addComponents }) => {
      addComponents({
        ".section-container": {
          width: "100%",
          maxWidth: "96rem",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          "@screen sm": {
            paddingLeft: "1.25rem",
            paddingRight: "1.25rem",
          },
          "@screen md": {
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
          },
          "@screen lg": {
            paddingLeft: "2rem",
            paddingRight: "2rem",
          },
          "@screen xl": {
            paddingLeft: "2.5rem",
            paddingRight: "2.5rem",
          },
          "@screen 2xl": {
            paddingLeft: "3rem",
            paddingRight: "3rem",
          },
        },
        ".text-hero": {
          fontSize: "clamp(2.25rem, 7vw, 4.75rem)",
          lineHeight: "1.02",
          letterSpacing: "-0.04em",
        },
        ".text-display": {
          fontSize: "clamp(1.65rem, 3.2vw, 2.5rem)",
          lineHeight: "1.1",
          letterSpacing: "-0.03em",
        },
        ".text-display-sm": {
          fontSize: "clamp(1.2rem, 2.2vw, 1.65rem)",
          lineHeight: "1.2",
          letterSpacing: "-0.02em",
        },
        ".text-body": {
          fontSize: "1.0625rem",
          lineHeight: "1.65",
        },
      });
    }),
  ],
};
export default config;
