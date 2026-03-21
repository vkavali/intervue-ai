// Custom Monaco editor themes — registered via monaco.editor.defineTheme()

export interface MonacoThemeDefinition {
  base: "vs" | "vs-dark" | "hc-black";
  inherit: boolean;
  rules: { token: string; foreground?: string; fontStyle?: string }[];
  colors: Record<string, string>;
}

export const CUSTOM_THEMES: Record<string, MonacoThemeDefinition> = {
  monokai: {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "75715E", fontStyle: "italic" },
      { token: "keyword", foreground: "F92672" },
      { token: "string", foreground: "E6DB74" },
      { token: "number", foreground: "AE81FF" },
      { token: "type", foreground: "66D9EF", fontStyle: "italic" },
      { token: "function", foreground: "A6E22E" },
      { token: "variable", foreground: "F8F8F2" },
      { token: "constant", foreground: "AE81FF" },
      { token: "tag", foreground: "F92672" },
      { token: "attribute.name", foreground: "A6E22E" },
      { token: "attribute.value", foreground: "E6DB74" },
      { token: "delimiter", foreground: "F8F8F2" },
      { token: "operator", foreground: "F92672" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#F8F8F2",
      "editor.lineHighlightBackground": "#3E3D32",
      "editor.selectionBackground": "#49483E",
      "editorCursor.foreground": "#F8F8F0",
      "editorWhitespace.foreground": "#3B3A32",
      "editorLineNumber.foreground": "#90908A",
      "editorLineNumber.activeForeground": "#C2C2BF",
      "editor.selectionHighlightBackground": "#49483E80",
      "editorBracketMatch.background": "#3E3D3275",
      "editorBracketMatch.border": "#888888",
    },
  },
  "github-dark": {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8B949E", fontStyle: "italic" },
      { token: "keyword", foreground: "FF7B72" },
      { token: "string", foreground: "A5D6FF" },
      { token: "number", foreground: "79C0FF" },
      { token: "type", foreground: "FFA657" },
      { token: "function", foreground: "D2A8FF" },
      { token: "variable", foreground: "C9D1D9" },
      { token: "constant", foreground: "79C0FF" },
      { token: "tag", foreground: "7EE787" },
      { token: "attribute.name", foreground: "79C0FF" },
      { token: "operator", foreground: "FF7B72" },
    ],
    colors: {
      "editor.background": "#0D1117",
      "editor.foreground": "#C9D1D9",
      "editor.lineHighlightBackground": "#161B22",
      "editor.selectionBackground": "#264F78",
      "editorCursor.foreground": "#C9D1D9",
      "editorWhitespace.foreground": "#484F58",
      "editorLineNumber.foreground": "#484F58",
      "editorLineNumber.activeForeground": "#C9D1D9",
      "editorBracketMatch.background": "#1B4B91",
      "editorBracketMatch.border": "#1B4B91",
    },
  },
  "one-dark-pro": {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5C6370", fontStyle: "italic" },
      { token: "keyword", foreground: "C678DD" },
      { token: "string", foreground: "98C379" },
      { token: "number", foreground: "D19A66" },
      { token: "type", foreground: "E5C07B" },
      { token: "function", foreground: "61AFEF" },
      { token: "variable", foreground: "E06C75" },
      { token: "constant", foreground: "D19A66" },
      { token: "tag", foreground: "E06C75" },
      { token: "attribute.name", foreground: "D19A66" },
      { token: "operator", foreground: "56B6C2" },
    ],
    colors: {
      "editor.background": "#282C34",
      "editor.foreground": "#ABB2BF",
      "editor.lineHighlightBackground": "#2C313C",
      "editor.selectionBackground": "#3E4451",
      "editorCursor.foreground": "#528BFF",
      "editorWhitespace.foreground": "#3B4048",
      "editorLineNumber.foreground": "#495162",
      "editorLineNumber.activeForeground": "#ABB2BF",
      "editorBracketMatch.background": "#515A6B",
      "editorBracketMatch.border": "#515A6B",
    },
  },
};

/**
 * Register all custom themes with Monaco editor.
 * Call this once when Monaco loads (e.g., in beforeMount or onMount).
 */
export function registerCustomThemes(monaco: typeof import("monaco-editor")) {
  for (const [name, theme] of Object.entries(CUSTOM_THEMES)) {
    monaco.editor.defineTheme(name, theme);
  }
}
