/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#FDF2F4',
          100: '#FCE7EB',
          200: '#F9D0D9',
          300: '#F4A9BA',
          400: '#EC7694',
          500: '#E04872',
          600: '#CC2D5B',
          700: '#AB1F49',
          800: '#800020',
          900: '#5C0017',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        script: ['Dancing Script', 'cursive'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
