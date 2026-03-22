// Editor settings management — persisted in localStorage

export interface EditorSettings {
  theme: string;
  fontSize: number;
  tabSize: 2 | 4;
  wordWrap: "on" | "off";
  minimap: boolean;
  keybindings: "default" | "vim";
  bracketPairColorization: boolean;
  lineNumbers: "on" | "off" | "relative";
  cursorBlinking: "blink" | "smooth" | "phase" | "expand" | "solid";
}

const STORAGE_KEY = "printf-editor-settings";

const DEFAULT_SETTINGS: EditorSettings = {
  theme: "vs-dark",
  fontSize: 14,
  tabSize: 2,
  wordWrap: "on",
  minimap: false,
  keybindings: "default",
  bracketPairColorization: true,
  lineNumbers: "on",
  cursorBlinking: "smooth",
};

export function getEditorSettings(): EditorSettings {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function saveEditorSettings(settings: Partial<EditorSettings>): EditorSettings {
  const current = getEditorSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function getDefaultSettings(): EditorSettings {
  return { ...DEFAULT_SETTINGS };
}

export const AVAILABLE_THEMES = [
  { value: "vs-dark", label: "Dark (Default)" },
  { value: "monokai", label: "Monokai" },
  { value: "github-dark", label: "GitHub Dark" },
  { value: "one-dark-pro", label: "One Dark Pro" },
  { value: "vs-light", label: "Light" },
] as const;
