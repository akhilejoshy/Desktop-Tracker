import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: '#F8F9FD',
        foreground: '#2B318A',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#2B318A',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#2B318A',
        },
        primary: {
          DEFAULT: '#5A81FA',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#2B318A',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#A8B1CE',
          foreground: '#6A6E83',
        },
        accent: {
          DEFAULT: '#6A6E83',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#FF4D4F',
          foreground: '#FFFFFF',
        },
        border: '#CDDEFF',
        input: '#FFFFFF',
        ring: '#5A81FA',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
