/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: 'rgb(var(--background-rgb) / <alpha-value>)',
        foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary-rgb) / <alpha-value>)',
          hover: 'rgb(var(--primary-hover-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground-rgb) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground-rgb) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground-rgb) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground-rgb) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--card-rgb) / <alpha-value>)',
          hover: 'rgb(var(--card-hover-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground-rgb) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--border-rgb) / <alpha-value>)',
          soft: 'rgb(var(--border-soft-rgb) / <alpha-value>)',
        },
        input: {
          DEFAULT: 'rgb(var(--input-rgb) / <alpha-value>)',
          focus: 'rgb(var(--input-focus-rgb) / <alpha-value>)',
        },
        ring: 'rgb(var(--ring-rgb) / <alpha-value>)',
        success: {
          DEFAULT: 'rgb(var(--success-rgb) / <alpha-value>)',
          bg: 'rgb(var(--success-bg-rgb) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--warning-rgb) / <alpha-value>)',
          bg: 'rgb(var(--warning-bg-rgb) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--danger-rgb) / <alpha-value>)',
          bg: 'rgb(var(--danger-bg-rgb) / <alpha-value>)',
        },
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        DEFAULT: 'var(--radius)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) + 4px)',
        xl: 'calc(var(--radius) + 8px)',
        '2xl': 'calc(var(--radius) + 16px)',
        '3xl': 'calc(var(--radius) + 24px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'glow-primary': '0 0 20px -5px rgba(56, 189, 248, 0.2)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};