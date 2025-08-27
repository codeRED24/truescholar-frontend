import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        public: ["Public Sans"],
        barlow: ["Barlow"],
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        xxs: "0.688rem",
        xs: "0.75rem",
        xsm: "0.813rem",
        sm: "0.875rem",
        md: "0.938rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "2xxl": "30px",
        "3xl": "1.75rem",
        "4xl": "2rem",
        "5xl": "2.625rem",
        "6xl": "3rem",
        "7xl": "3.5rem",
        "8xl": "4rem",
        home: "72px",
      },
      letterSpacing: {
        tightest: "-0.05em",
        tighter: "-0.025em",
        tight: "-0.01em",
        normal: "0",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      lineHeight: {
        none: "8px",
        tight: "12px",
        snug: "16px",
        normal: "20px",
        relaxed: "20.8px",
        loose: "24px",
        spacious: "40px",
        wide: "48px",
        veryWide: "56px",
        ultraWide: "64px",
        superWide: "72px",
        expansive: "80px",
        megaExpansive: "88px",
        hyperExpansive: "96px",
        colossal: "104px",
        enormous: "112px",
        gigantic: "120px",
      },
      colors: {
        gray: {
          "1": "#F9FAFB",
          "2": "#F2F4F7",
          "3": "#D0D5DD",
          "4": "#98A2B3",
          "5": "#667085",
          "6": "#344054",
          "7": "#1D2939",
          "8": "#101828",
        },
        primary: {
          "1": "#C8FAD6",
          "2": "#5BE49B",
          "3": "#007867",
          "4": "#004B50",
          "5": "#00A76F",
          "6": "#00A76F",
          "7": "#2B518D",
          main: "#00A76F",
        },
        secondary: {
          "1": "#FFF8F5",
          "2": "#FFF5F1",
          "3": "#FFE7DF",
          "4": "#FFD0C1",
          "5": "#FFAE94",
          "6": "#FF875F",
          "8": "#FF3F00",
          brand: "#FB6534",
        },
        input: "#D0D5DD",
        background: "#FFFFFF",
        foreground: "#101828",
        ring: "#00A76F",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "college-head":
          "radial-gradient(circle, rgba(13,92,40,0.9654455532212886) 0%, rgba(0,0,0,1) 100%)",
        "exam-head":
          "linear-gradient(90deg, rgba(0,0,0,0.9038209033613446) 20%, rgba(0,0,0,0.6657256652661064) 50%, rgba(0,0,0,0.9) 80%)",
      },
      boxShadow: {
        card1: "0px 0px 24px 0px #65656524",
        card2: "0px 0px 9px 0px #BEBEBE40",
        course: "rgba(0, 0, 0, 0.05) 0px 0px 0px 1px",
        btnShadow: "0px 1px 2px 0px #E2E2E245",
        blur: "0px 0px 10px 0px #89898924",
        video:
          "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset",
      },
      borderRadius: {
        custom: "42px",
        "custom-sm": "32px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        fadeIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideOut: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(20%)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.3s ease-out forwards",
        slideIn: "slideIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards",
        "slide-up": "slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        slideOut: "slideOut 0.3s ease-in forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
