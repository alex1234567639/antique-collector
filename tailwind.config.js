/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Noto Serif TC', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#8b6914',
          soft: '#e8dfc4',
        },
      },
    },
  },
  plugins: [],
}
