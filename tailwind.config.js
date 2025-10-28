/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- 確保這行存在且正確
  ],
  theme: {
    extend: {
      screens: {
        standalone: {'raw': "(display:standalone)"},
      },
    },
  },
  plugins: [
  ],
}

