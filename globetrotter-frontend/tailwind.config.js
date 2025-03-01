/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  safelist: [
    'text-4xl', 'font-bold', 'text-blue-500', 'bg-black', 'text-white',
    'p-4', 'm-2', 'rounded-full', 'shadow-lg'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
