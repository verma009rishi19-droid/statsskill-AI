/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        gov: {
          blue: '#1d4ed8',
          darkblue: '#1e40af',
          lightblue: '#3b82f6',
          slate: '#475569',
          border: '#e2e8f0',
          bg: '#f8fafc',
          card: '#ffffff'
        }
      }
    },
  },
  plugins: [],
}
