/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0B',
        surface: '#161616',
        surface2: '#1C1C1C',
        border: '#2A2A2A',
        accent: '#E10600',
        'accent-h': '#C40500',
        text: '#FFFFFF',
        muted: '#BFBFBF',
        dim: '#555555',
      },
    },
  },
  plugins: [],
}