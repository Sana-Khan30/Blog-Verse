/** @type {import('tailwindcss').Config} */
export default {
  // ── darkMode: 'class' lets ThemeContext add/remove .dark on <html> ──
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Resolves every bg-dark-* / text-dark-* reference in your codebase
        dark: {
          800: '#111118',
          900: '#0a0a0f',
          950: '#05050a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Smooth spring easing used throughout Framer Motion
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backdropBlur: {
        xs: '4px',
      },
      boxShadow: {
        'glow-violet': '0 0 24px rgba(139,92,246,0.35)',
        'glow-cyan':   '0 0 24px rgba(6,182,212,0.35)',
        'card':        '0 4px 24px rgba(0,0,0,0.18)',
        'card-hover':  '0 12px 40px rgba(0,0,0,0.28)',
        'navbar':      '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        'fade-in': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        gradient:  'gradient 15s ease infinite',
        'fade-in': 'fade-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        shimmer:   'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [
    // ── no-scrollbar utility (replaces custom CSS) ──
    function ({ addUtilities }) {
      addUtilities({
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width':    'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    },
  ],
};