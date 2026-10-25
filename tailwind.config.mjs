/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter Tight', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        night: {
          50: '#f4f5fc',
          100: '#e8ebf8',
          200: '#cdd6f0',
          300: '#9aa9d1',
          400: '#6978b4',
          500: '#3d4b8b',
          600: '#2e3f73',
          700: '#1d2b4d',
          800: '#151b2d',
          900: '#0c1020',
        },
        primary: {
          50: '#eeecff',
          100: '#e4e0ff',
          500: '#625BFF',
          600: '#5047EA',
          700: '#3f3cc4',
        },
      },
      boxShadow: {
        soft: '0 18px 45px rgba(17, 24, 39, 0.08)',
      },
    },
  },
  plugins: [],
};
