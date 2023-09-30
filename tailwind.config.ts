import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false,
  },
  darkMode: "class",
  plugins: [],
} satisfies Config;
