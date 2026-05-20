/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: '#1A1A2E',
        'ink-light': '#16213E',
        vermilion: '#C53D43',
        pine: '#2D6A4F',
        amber: '#E9A319',
        moonwhite: '#F5F0EB',
      },
      fontFamily: {
        lxgw: ['"LXGW WenKai"', 'sans-serif'],
      },
      animation: {
        'subtle-glow': 'subtle-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'subtle-glow': {
          '0%, 100%': {
            boxShadow: '0 0 8px rgba(197, 61, 67, 0.15)',
          },
          '50%': {
            boxShadow: '0 0 16px rgba(197, 61, 67, 0.3)',
          },
        },
      },
    },
  },
  plugins: [],
};
