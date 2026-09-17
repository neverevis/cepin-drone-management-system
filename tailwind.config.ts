import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cepin: {
          50: "#eef6ee",
          100: "#d5e9d6",
          200: "#aad3ac",
          300: "#7bb87f",
          400: "#4f9c56",
          500: "#2f7d38",
          600: "#22622b",
          700: "#1c4e23",
          800: "#173f1d",
          900: "#0f2a13",
        },
      },
    },
  },
  plugins: [],
};
export default config;
