/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#21262D",
          "primary-content": "#3262a8",
          secondary: "#3262a8",
          "secondary-content": "#212638",
          accent: "#21262D",
          "accent-content": "#212638",
          neutral: "#212638",
          "neutral-content": "#ccd6e3",
          "base-100": "#6398e6",
          "base-200": "#b8cbe6",
          "base-300": "#d5e2f5",
          "base-content": "#212638",
          info: "#93BBFB",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        dark: {
          primary: "#3262a8",
          "primary-content": "#132136",
          secondary: "#223754",
          "secondary-content": "#ffffff",
          accent: "#3262a8",
          "accent-content": "#152d52",
          neutral: "#ffffff",
          "neutral-content": "#152d52",
          "base-100": "#102d57",
          "base-200": "#092347",
          "base-300": "#03152e",
          "base-content": "#ffffff",
          info: "#385183",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};
