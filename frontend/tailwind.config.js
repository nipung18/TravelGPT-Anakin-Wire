/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#080c14',
        cardBg: 'rgba(19, 25, 40, 0.7)',
        borderBg: 'rgba(255, 255, 255, 0.08)',
        accentCyan: '#06b6d4',
        accentPurple: '#8b5cf6',
        accentPink: '#ec4899',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-slow': 'glow 4s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(6, 182, 212, 0.15)' },
          '100%': { boxShadow: '0 0 25px rgba(139, 92, 246, 0.35)' },
        }
      }
    },
  },
  plugins: [],
}
