import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: "#1b1b1b",
        light: "#fff",
        accent: "#d97e23",
        accentDark: "#ffdb4d",
        gray: "#747474",
      },
      fontFamily: {
        "ms": ["var(--font-ms)"],
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
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
export default config
