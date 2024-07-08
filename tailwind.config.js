/** @type {import('tailwindcss').Config} */

import TailwindScrollbarHide from 'tailwind-scrollbar-hide'

export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        raleway: ['Raleway', 'sans-serif']
      },
      colors: {
        white: "#FFFFFF",
        backgroundGrey: "#F8F8F8",
        lightGray: "#E0E0E0",
        grey: "#707070",
        darkGrey: "#545454",
        black: "#000000",
        redError: "#ff0000",
        red: "#F43535",
        orange: "#FF7600",
        darkOrange: "#FC8621",
        yellow: "#FFE53C",
        lightYellow: "#fff4af",
        backgroundMarine: "#001228",
        marine: "#0B2747",
        pink: "#DA005A",
        green: "#37D6B5",
        lightGreen: "#8cc408",
        darkGreen: "#0f9b2c",
        green2: "#0F9B2C",
        green3: "#19982B",
        gray2: "#A6A6A6",
        purple: "#8A2BE2",
        blueGeo: "#4D8CCB"
      },
    },
    screens: {
      'sm': '768px',
      'md': '1200px',
      'lg': '1400px',
      'xl': '1565px'
    },
    keyframes: {
      rotate: {
        'from': { transform: 'rotate(0deg)' },
        'to': { transform: 'rotate(360deg)' },
      },
    },
    animation: {
      rotate: 'rotate 60s linear infinite',
    },
    backgroundImage: {
      'custom-gradient': 'linear-gradient(to right, #37D6B5, #8cc408, #8CC408, #FFE53C, #FF7600, #DA005A)',
      'right-gradient': 'linear-gradient(to right, #FFFFFF, #FFFFFF, #0F9B2C, #0F9B2C)',
    },
  },
  plugins: [
    TailwindScrollbarHide
  ],
}

