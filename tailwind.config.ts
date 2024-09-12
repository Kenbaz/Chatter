import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1a1a1a",
        secondary: "#3E4C59",
        spanColor: "#52606D",
        tinWhite: "#FFFFFFDE",
        headerColor: "#0a0a0a",
        lightGray: "#555",
        lightGray2: "#666",
        customGray1: "#262626",
        customWhite: "#e0e6f2",
        customGray: "#373737",
        customBlack: "#0a0a0a",
        gold1: "#FFB700",
        gold2: "#FFC300",
        gold3: "#FFD000",
        gold4: "#DBB42C",
        customBrown: "#FAD643",
        customWhite2: "#e9e8e4",
        customWhite3: "#FEFEFE",
        customGray3: "#CCCCCC",
        shimmerColor: "rgba(255, 255, 255, 0.01)",
        whiteShimmer: "rgba(209, 213, 219, 0.30)",
      },
      scale: {
        20: "0.3",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      textStroke: {
        black:
          "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
        teal: "-1px -1px 0 teal, 1px -1px 0 teal, -1px 1px 0 teal, 1px 1px 0 teal",
      },
      textShadow: {
        default: "2px 2px 4px rgba(0,0,0,0.5)",
        lg: "4px 4px 6px rgba(0,0,0,0.5)",
      },
      boxShadow: {
        custom:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: Function }) {
      const newUtilities = {
        ".text-stroke": {
          "-webkit-text-stroke": "1px",
          "text-stroke": "1px",
        },
        ".text-stroke-0": {
          "-webkit-text-stroke": "0",
          "text-stroke": "0",
        },
        ".text-outline-teal": {
          textShadow:
            "-1px -1px 0 teal, 1px -1px 0 teal, -1px 1px 0 teal, 1px 1px 0 teal",
        },
        ".text-shadow": {
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
        },
        ".text-shadow-lg": {
          textShadow: "4px 4px 6px rgba(0,0,0,0.5)",
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
export default config;
