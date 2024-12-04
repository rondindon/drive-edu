/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        main: {
          darkBlue: "#2C3E50",
          green: "#27AE60",
          yellow: "#F1C40F",
        },
        secondary: {
          lightGray: "#ECF0F1",
          red: "#E74C3C",
          greenBackground: "#EDFFEC",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        bam: ['BAM', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'dashed-line': 'repeating-linear-gradient(to right, white 0%, white 30%, transparent 30%, transparent 60%)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleUp: {
          '0%': { transform: 'scale(.96)', opacity: 0.8 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        scaleUp: 'scaleUp 0.5s ease-in-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};