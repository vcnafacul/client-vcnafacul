/* eslint-disable no-mixed-spaces-and-tabs */
/** @type {import('tailwindcss').Config} */

import TailwindScrollbarHide from "tailwind-scrollbar-hide";
import TailwindTypography from "@tailwindcss/typography";
import typeScale from "./tailwind/type-scale.js";

const c = (v) => `hsl(var(--${v}) / <alpha-value>)`;
const pair = (n) => ({ DEFAULT: c(n), foreground: c(`${n}-foreground`) });

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx,mdx}", "./.storybook/**/*.{ts,tsx}"],
  theme: {
    // A escala de texto é o plugin type-scale (text-body, text-h1...); text-sm etc. não existem mais.
    fontSize: {},
    extend: {
      fontFamily: {
        raleway: ["Raleway", "sans-serif"],
        sans: ["Raleway", "sans-serif"],
      },
      colors: {
        // ---- semânticas (design system) ----
        background: c("background"),
        foreground: c("foreground"),
        page: c("page"),
        card: pair("card"),
        popover: pair("popover"),
        primary: pair("primary"),
        secondary: pair("secondary"),
        muted: pair("muted"),
        accent: pair("accent"),
        cta: pair("cta"),
        highlight: c("highlight"),
        destructive: { ...pair("destructive"), muted: c("destructive-muted") },
        success: { ...pair("success"), muted: c("success-muted") },
        warning: { ...pair("warning"), muted: c("warning-muted") },
        info: { ...pair("info"), muted: c("info-muted") },
        border: c("border"),
        input: c("input"),
        ring: c("ring"),
        chart: Object.fromEntries([1, 2, 3, 4, 5, 6].map((i) => [i, c(`chart-${i}`)])),
        sidebar: {
          DEFAULT: c("sidebar-background"),
          foreground: c("sidebar-foreground"),
          primary: c("sidebar-primary"),
          "primary-foreground": c("sidebar-primary-foreground"),
          accent: c("sidebar-accent"),
          "accent-foreground": c("sidebar-accent-foreground"),
          border: c("sidebar-border"),
          ring: c("sidebar-ring"),
        },
        // Só o branco e o preto fora dos tokens; o resto da paleta é a padrão do Tailwind.
        white: "#FFFFFF",
        black: "#000000",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(11,39,71,.08)",
        md: "0 4px 12px rgba(11,39,71,.10), 0 1px 3px rgba(11,39,71,.06)",
        lg: "0 16px 40px rgba(11,39,71,.18), 0 2px 8px rgba(11,39,71,.08)",
        DEFAULT: "0 1px 2px rgba(11,39,71,.08)",
      },
      zIndex: {
        base: "0",
        raised: "10",
        sticky: "20",
        header: "30",
        overlay: "40",
        popover: "50",
        toast: "60",
      },
      maxWidth: { "prose-content": "720px", form: "560px", page: "1200px" },
      height: { header: "var(--header-h)" },
      spacing: { header: "var(--header-h)" },
      container: {
        center: true,
        padding: { DEFAULT: "16px", sm: "24px", md: "32px" },
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "hsl(var(--foreground))",
            "--tw-prose-headings": "hsl(var(--foreground))",
            "--tw-prose-lead": "hsl(var(--muted-foreground))",
            "--tw-prose-links": "hsl(var(--primary))",
            "--tw-prose-bold": "hsl(var(--foreground))",
            "--tw-prose-counters": "hsl(var(--muted-foreground))",
            "--tw-prose-bullets": "hsl(var(--muted-foreground))",
            "--tw-prose-hr": "hsl(var(--border))",
            "--tw-prose-quotes": "hsl(var(--foreground))",
            "--tw-prose-quote-borders": "hsl(var(--border))",
            "--tw-prose-captions": "hsl(var(--muted-foreground))",
            "--tw-prose-code": "hsl(var(--foreground))",
            "--tw-prose-th-borders": "hsl(var(--border))",
            "--tw-prose-td-borders": "hsl(var(--border))",
            maxWidth: "none",
            fontSize: "16px",
            lineHeight: "1.7",
            a: { textDecoration: "underline" },
            h2: { fontSize: "20px", lineHeight: "1.25" },
            h3: { fontSize: "16px", lineHeight: "1.3" },
            h4: { fontSize: "14px", lineHeight: "1.4" },
          },
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        rotate: {
          from: {
            transform: "rotate(0deg)",
          },
          to: {
            transform: "rotate(360deg)",
          },
        },
        "attention-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(255,118,0,0.7)" },
          "70%": { boxShadow: "0 0 0 12px rgba(255,118,0,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(255,118,0,0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "attention-ring": "attention-ring 2s infinite",
        rotate: "rotate 60s linear infinite",
        rotate30: "rotate 30s linear infinite",
        rotate15: "rotate 15s linear infinite",
        rotate5: "rotate 5s linear infinite",
      },
      backgroundImage: {
        "brand-stripe":
          "linear-gradient(to right, hsl(var(--mint-400)), #8CC408, hsl(var(--yellow-300)), hsl(var(--orange-500)), hsl(var(--pink-600)))",
        "custom-gradient":
          "linear-gradient(to right, #37D6B5, #8cc408, #8CC408, #FFE53C, #FF7600, #DA005A)",
        "right-gradient":
          "linear-gradient(to right, #FFFFFF, #FFFFFF, #0F9B2C, #0F9B2C)",
      },
    },
    screens: {
      sm: "768px",
      md: "1200px",
      lg: "1400px",
      xl: "1565px",
    },
  },
  plugins: [
    TailwindScrollbarHide,
    TailwindTypography,
    typeScale,
    // prose: 16px no mobile, 17px a partir de 768px (o plugin de typography não aceita @media aqui)
    ({ addComponents }) =>
      addComponents({ "@media (min-width: 768px)": { ".prose": { fontSize: "17px" } } }),
    // eslint-disable-next-line no-undef
    require("tailwindcss-animate"),
  ],
};
