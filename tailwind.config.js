/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',  // If you have a root App.js file
    './app/**/*.{js,jsx,ts,tsx}',  // To capture all files in the app folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
