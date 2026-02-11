/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#0036FF',
        secondary: '#9C27B0',
        success: '#4CAF50',
        error: '#f44336',
        warning: '#FF9800',
        info: '#00BCD4',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
}
