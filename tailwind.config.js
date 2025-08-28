/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], 
  theme: {
    extend: {
      fontFamily: {
        norwester: ["Norwester", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        dancing: ['DancingScript', 'cursive'],
      },
    },
  },
  plugins: [],
};
