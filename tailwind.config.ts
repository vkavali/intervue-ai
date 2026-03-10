import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Warm dark palette for long-session focus (editor/practice)
        editor: {
          DEFAULT: '#0e0e16',   // warm deep dark (main bg)
          panel:   '#151520',   // warm panel bg (sidebars, top bar)
          surface: '#1c1c2a',   // interactive surfaces (buttons, inputs)
          border:  '#252538',   // soft warm border
          hover:   '#2c2c40',   // hover state
          muted:   '#3a3a52',   // muted elements
        },
      },
    },
  },
  plugins: [],
};
export default config;
