import type { Config } from "tailwindcss";

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
        primary: 'rgb(var(--primary-color) / <alpha-value>)',
        secondary: 'rgb(var(--secondary-color) / <alpha-value>)',
        tertiary: 'rgb(var(--tertiary-color) / <alpha-value>)',
        card: {
          bg: 'rgb(var(--card-bg) / <alpha-value>)',
          border: 'rgb(var(--card-border) / <alpha-value>)',
        },
        hover: {
          bg: 'rgb(var(--hover-bg) / <alpha-value>)',
        },
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
  plugins: [],
};
export default config;
