/** @type {import('tailwindcss').Config} */
export default {
  // The content array is still correct and necessary
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ], 
  theme: {
    extend: {
      // All your theme customizations can still go here
    },
  },
  // Remove or leave the plugins array empty
  plugins: [], 
}