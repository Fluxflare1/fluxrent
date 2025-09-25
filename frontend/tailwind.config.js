/** @type {import('tailwindcss').Config} */
module.exports = {
   content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./pages/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f5fbff",
          100: "#e6f4ff",
          500: "#0ea5e9",
          700: "#0369a1"
        }
      }
    }
  },
  plugins: []
};
