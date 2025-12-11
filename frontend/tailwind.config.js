/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        border: '#2a2a2a',
        primary: {
          50: '#fffef0',
          100: '#fffce0',
          200: '#fff9c0',
          300: '#fff580',
          400: '#fff140',
          500: '#FFD700', // Jaune Hyrox principal
          600: '#E6C200',
          700: '#CCAD00',
          800: '#B39900',
          900: '#998500',
        },
        hyrox: {
          black: '#000000',
          yellow: '#FFD700',
          white: '#FFFFFF',
          gray: {
            50: '#f9f9f9',
            100: '#f0f0f0',
            200: '#e0e0e0',
            300: '#c0c0c0',
            400: '#a0a0a0',
            500: '#808080',
            600: '#606060',
            700: '#404040',
            800: '#2a2a2a',
            900: '#1a1a1a',
          },
        },
        dark: {
          50: '#2a2a2a',
          100: '#1f1f1f',
          200: '#1a1a1a',
          300: '#151515',
          400: '#121212',
          500: '#0f0f0f',
          600: '#0a0a0a',
          700: '#080808',
          800: '#050505',
          900: '#000000',
        },
      },
    },
  },
  plugins: [],
};


