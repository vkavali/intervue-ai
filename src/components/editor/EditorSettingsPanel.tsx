"use client";

import { useState, useRef, useEffect } from "react";
import {
  type EditorSettings,
  getEditorSettings,
  saveEditorSettings,
  getDefaultSettings,
  AVAILABLE_THEMES,
} from "@/lib/editor-settings";

interface EditorSettingsPanelProps {
  onSettingsChange: (settings: EditorSettings) => void;
}

export default function EditorSettingsPanel({ onSettingsChange }: EditorSettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<EditorSettings>(getEditorSettings);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  function update(partial: Partial<EditorSettings>) {
    const updated = saveEditorSettings(partial);
    setSettings(updated);
    onSettingsChange(updated);
  }

  function resetDefaults() {
    const defaults = getDefaultSettings();
    const updated = saveEditorSettings(defaults);
    setSettings(updated);
    onSettingsChange(updated);
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`rounded-lg px-2 py-1.5 text-xs transition-colors ${
          open
            ? "bg-white/10 text-white"
            : "bg-editor-surface text-gray-400 hover:text-white"
        }`}
        title="Editor Settings"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-editor-border bg-editor-panel shadow-2xl">
          <div className="flex items-center justify-between border-b border-editor-border px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Editor Settings</h3>
            <button
              onClick={resetDefaults}
              className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              Reset Defaults
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
            {/* Theme */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => update({ theme: e.target.value })}
                className="w-full rounded-lg border border-editor-border bg-editor-surface px-3 py-1.5 text-xs text-gray-300 focus:border-saffron focus:outline-none"
              >
                {AVAILABLE_THEMES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Font Size: {settings.fontSize}px
              </label>
              <input
                type="range"
                min={12}
                max={24}
                value={settings.fontSize}
                onChange={(e) => update({ fontSize: parseInt(e.target.value) })}
                className="w-full accent-saffron"
              />
              <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                <span>12px</span>
                <span>24px</span>
              </div>
            </div>

            {/* Tab Size */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Tab Size
              </label>
              <div className="flex gap-2">
                {([2, 4] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => update({ tabSize: size })}
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      settings.tabSize === size
                        ? "border-saffron bg-saffron/10 text-saffron"
                        : "border-editor-border bg-editor-surface text-gray-400 hover:text-white"
                    }`}
                  >
                    {size} spaces
                  </button>
                ))}
              </div>
            </div>

            {/* Word Wrap */}
            <ToggleSetting
              label="Word Wrap"
              checked={settings.wordWrap === "on"}
              onChange={(v) => update({ wordWrap: v ? "on" : "off" })}
            />

            {/* Minimap */}
            <ToggleSetting
              label="Minimap"
              checked={settings.minimap}
              onChange={(v) => update({ minimap: v })}
            />

            {/* Bracket Pair Colorization */}
            <ToggleSetting
              label="Bracket Colors"
              checked={settings.bracketPairColorization}
              onChange={(v) => update({ bracketPairColorization: v })}
            />

            {/* Line Numbers */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Line Numbers
              </label>
              <div className="flex gap-1">
                {(["on", "off", "relative"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => update({ lineNumbers: opt })}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors capitalize ${
                      settings.lineNumbers === opt
                        ? "border-saffron bg-saffron/10 text-saffron"
                        : "border-editor-border bg-editor-surface text-gray-400 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Keybindings */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Keybindings
              </label>
              <div className="flex gap-2">
                {(["default", "vim"] as const).map((kb) => (
                  <button
                    key={kb}
                    onClick={() => update({ keybindings: kb })}
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                      settings.keybindings === kb
                        ? "border-saffron bg-saffron/10 text-saffron"
                        : "border-editor-border bg-editor-surface text-gray-400 hover:text-white"
                    }`}
                  >
                    {kb}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleSetting({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? "bg-saffron" : "bg-editor-hover"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </div>
  );
}
