import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "overlay-gradient": "linear-gradient(to right, #77a1d3, #79cbca, #e684ae)"
      },
      backgroundColor: {
        "primary": "#f2f3f5",
        "darkVariant": "#4C535D",
        "default": "#f0f8ff",
        "blueVariant": "#3c41c2",
        "darkBlueVariant": "#1e2179"
      }
    },
  },
  plugins: [],
};
export default config;
