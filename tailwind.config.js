/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0a2342',
          50:  '#e8eef5',
          100: '#c5d3e8',
          200: '#9fb6d9',
          300: '#7899ca',
          400: '#5a83be',
          500: '#3c6db3',
          600: '#2a5a9f',
          700: '#1a4585',
          800: '#0f3068',
          900: '#0a2342',
          950: '#061629',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e8c96a',
          dark:  '#a07c2e',
        },
      },
      fontFamily: {
        sans:    ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        mono:    ['monospace'],
      },
      animation: {
        'fade-in-up':    'fadeInUp 0.6s ease-out forwards',
        'fade-in':       'fadeIn 0.4s ease-out forwards',
        'pulse-gold':    'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,168,76,0.4)' },
          '50%':      { boxShadow: '0 0 0 10px rgba(201,168,76,0)' },
        },
      },
      boxShadow: {
        'card':       '0 4px 24px rgba(10,35,66,0.08)',
        'card-hover': '0 12px 48px rgba(10,35,66,0.18)',
        'gold':       '0 4px 20px rgba(201,168,76,0.3)',
        'navy':       '0 8px 32px rgba(10,35,66,0.25)',
      },
    },
  },
  plugins: [],
}
