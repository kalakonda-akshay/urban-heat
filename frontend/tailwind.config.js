/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: 'var(--console-bg)',
          900: 'var(--console-surface)',
          800: 'var(--console-border)',
          700: 'var(--console-border)',
          600: 'var(--console-textSec)',
          accent: 'var(--console-accent)', // ISRO Orange
          solar: 'var(--console-accent)',
          aurora: 'var(--console-status-low)',
        },
        console: {
          bg: 'var(--console-bg)',
          surface: 'var(--console-surface)',
          border: 'var(--console-border)',
          text: 'var(--console-text)',
          textSec: 'var(--console-textSec)',
          orange: 'var(--console-accent)',
          extreme: 'var(--console-status-extreme)',
          extremeBg: 'var(--console-status-extreme-bg)',
          extremeBorder: 'var(--console-status-extreme-border)',
          high: 'var(--console-status-high)',
          highBg: 'var(--console-status-high-bg)',
          highBorder: 'var(--console-status-high-border)',
          medium: 'var(--console-status-medium)',
          mediumBg: 'var(--console-status-medium-bg)',
          mediumBorder: 'var(--console-status-medium-border)',
          low: 'var(--console-status-low)',
          lowBg: 'var(--console-status-low-bg)',
          lowBorder: 'var(--console-status-low-border)'
        }
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'thermal-gradient': 'linear-gradient(to right, #4C1D95, #2563EB, #06B6D4, #22C55E, #EAB308, #F97316, #DC2626)',
      },
      boxShadow: {
        'none': 'none',
      },
    },
  },
  plugins: [],
}
