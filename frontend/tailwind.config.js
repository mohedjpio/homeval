/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          50:'#f0f9f4', 100:'#d9f0e4', 200:'#9FE1CB',
          500:'#1d9e75', 600:'#0f6e56', 700:'#085041', 900:'#04342c',
        },
        sand: {
          50:'#fafaf7', 100:'#f2f1ec', 200:'#e4e2d8',
          400:'#b8b5a6', 600:'#7a7768',
        },
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}
