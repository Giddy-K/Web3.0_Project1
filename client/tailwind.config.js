import formsPlugin from "@tailwindcss/forms";
 
export const purge = ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"];
export const mode = "jit";
export const darkMode = false;
export const theme = {
  fontFamily: {
    display: ["Open Sans", "sans-serif"],
    body: ["Open Sans", "sans-serif"],
  },
  extend: {
    screens: {
      mf: "990px",
    },
    keyframes: {
      "slide-in": {
        "0%": {
          "-webkit-transform": "translateX(120%)",
          transform: "translateX(120%)",
        },
        "100%": {
          "-webkit-transform": "translateX(0%)",
          transform: "translateX(0%)",
        },
      },
    },
    animation: {
      "slide-in": "slide-in 0.5s ease-out",
    },
  },
};
export const variants = {
  extend: {},
};
export const plugins = [formsPlugin];