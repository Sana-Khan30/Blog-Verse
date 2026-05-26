/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {

      /* ─────────────────────────────────────────
         FIX: font-display class was used in Hero
         (className="font-display") but never
         defined here → browser fell back to
         system condensed font instead of Bebas Neue
      ───────────────────────────────────────── */
      fontFamily: {
        'display': ["'Bebas Neue'", "'Cinzel'", 'sans-serif'],
        'body':    ["'Inter'",      'system-ui', 'sans-serif'],
        'sans':    ["'Inter'",      'system-ui', 'sans-serif'],
      },

      /* ─────────────────────────────────────────
         Map CSS variable colors into Tailwind
         so you can use bg-violet, text-cyan etc.
      ───────────────────────────────────────── */
      colors: {
        violet: {
          DEFAULT: 'var(--violet)',
          2:       'var(--violet-2)',
        },
        cyan: {
          DEFAULT: 'var(--cyan)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          2:       'var(--surface-2)',
        },
        bg: {
          DEFAULT: 'var(--bg)',
          2:       'var(--bg-2)',
          3:       'var(--bg-3)',
        },
      },

      /* ─────────────────────────────────────────
         Border radius tokens
      ───────────────────────────────────────── */
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      /* ─────────────────────────────────────────
         Animation utilities
      ───────────────────────────────────────── */
      animation: {
        'shimmer':      'shimmer 1.6s infinite',
        'float':        'float 6s ease-in-out infinite',
        'glow-pulse':   'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition:  '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '1'   },
        },
      },

      /* ─────────────────────────────────────────
         Backdrop blur utilities
      ───────────────────────────────────────── */
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
};