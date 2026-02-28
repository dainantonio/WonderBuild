import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bubblegum: "#ff63b8",
        ocean: "#5c8dff",
        mint: "#49d9b5",
        night: "#1f2d4f"
      },
      boxShadow: {
        card: "0 12px 30px rgba(31, 45, 79, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
