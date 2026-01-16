import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Use class strategy for dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary-color) / <alpha-value>)',
          50: 'rgb(var(--primary-50) / <alpha-value>)',
          100: 'rgb(var(--primary-100) / <alpha-value>)',
          500: 'rgb(var(--primary-500) / <alpha-value>)',
          600: 'rgb(var(--primary-600) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary-color) / <alpha-value>)',
          100: 'rgb(var(--secondary-100) / <alpha-value>)',
          400: 'rgb(var(--secondary-400) / <alpha-value>)',
          500: 'rgb(var(--secondary-500) / <alpha-value>)',
          600: 'rgb(var(--secondary-600) / <alpha-value>)',
        },
        tertiary: 'rgb(var(--tertiary-color) / <alpha-value>)',
        surface: {
          0: 'rgb(var(--surface-0) / <alpha-value>)',
          1: 'rgb(var(--surface-1) / <alpha-value>)',
          2: 'rgb(var(--surface-2) / <alpha-value>)',
        },
        card: {
          bg: 'rgb(var(--card-bg) / <alpha-value>)',
          border: 'rgb(var(--card-border) / <alpha-value>)',
        },
        hover: {
          bg: 'rgb(var(--hover-bg) / <alpha-value>)',
        },
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'elevated': '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        fadeInOut: {
          '0%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        roll: {
          "0%": { transform: "translateX(-33%)" },
          "50%": { transform: "translateX(33%)" },
          "100%": { transform: "translateX(-33%)" },
        }
      },
      animation: {
        fadeInOut: 'fadeInOut 6s infinite',
        fadeInOutDelayed: 'fadeInOut 6s 3s infinite',
        roll: "roll 20s linear infinite"
      },
    },
  },
  plugins: [typography],
};
export default config;
