/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
        'cormorant': ['"Cormorant Garamond"', 'serif'],
      },
      letterSpacing: {
        '1': '1px',
      },
      fontSize: {
        'xs-10': ['10px', '1.4'],
        'xs-11': ['11px', '1.5'],
        'xs-12': ['12px', '1.5'],
        'xs-13': ['13px', '1.6'],
        'sm-13': ['13px', '1.4'],
        'sm-14': ['14px', '1.5'],
        'sm-15': ['15px', '1.5'],
        'base-15': ['15px', '1.7'],
        'lg-18': ['18px', '1.5'],
        'xl-22': ['22px', '1.4'],
      },
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
        '15': '3.75rem',
        '25': '6.25rem',
        '30': '7.5rem',
      },
      colors: {
        primary: {
          50: '#fafaf8',
          100: '#f4f3ee',
          500: '#1a1a2e',
          600: '#5a5a6e',
          700: '#6a6a7e',
          800: '#8a8a9e',
        },
      },
    },
  },
  plugins: [],
}
