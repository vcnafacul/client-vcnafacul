/** @type {import('tailwindcss').Config} */
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
        gray2: "#A6A6A6"
      }
    },
    screens: {
      'sm': '768px',
      'md': '1200px',
    },
    
  },
  plugins: [],
}

