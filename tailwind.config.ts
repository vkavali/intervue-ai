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
        saffron: {
          DEFAULT: '#d4a574',
          light:   '#e0c4a8',
          dark:    '#b8906a',
        },
        'india-green': {
          DEFAULT: '#6b9e6b',
          light:   '#8fb88f',
          dark:    '#4d7a4d',
        },
        editor: {
          DEFAULT: '#111118',   // warm deep dark (main bg)
          panel:   '#18181f',   // warm panel bg (sidebars, top bar)
          surface: '#222230',   // interactive surfaces (buttons, inputs)
          border:  '#2e2e42',   // soft warm border
          hover:   '#363650',   // hover state
          muted:   '#45455e',   // muted elements
        },
      },
    },
  },
  plugins: [],
};
export default config;
