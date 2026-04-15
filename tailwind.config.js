/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Extend with Figma tokens when rebuilding marketing + aligning dashboard (see docs/DASHBOARD_PHASE1_AND_FIGMA_NEXT_PHASE_APR14_2026.md)
    extend: {},
  },
  plugins: [],
};
