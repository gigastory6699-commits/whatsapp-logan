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
          950: '#030303',
          900: '#07070a',
          850: '#0c0d12',
          800: '#11131c',
          700: '#1e2230',
        },
        accent: {
          neon: '#6366f1', // Indigo
          teal: '#14b8a6', // Teal
          rose: '#f43f5e', // Rose
          emerald: '#10b981', // Emerald green
        }
      },
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif'],
        sans: ['Inter', 'Tajawal', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.2), 0 0 10px rgba(99, 102, 241, 0.1)' },
          '100%': { boxShadow: '0 0 15px rgba(99, 102, 241, 0.6), 0 0 30px rgba(99, 102, 241, 0.3)' }
        }
      }
    },
  },
  plugins: [],
}
