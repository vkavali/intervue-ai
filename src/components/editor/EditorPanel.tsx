"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Editor, { type OnMount, type BeforeMount } from "@monaco-editor/react";
import type { editor as monacoEditor } from "monaco-editor";
import { type EditorSettings, getEditorSettings } from "@/lib/editor-settings";
import { registerCustomThemes } from "@/lib/monaco-themes";

interface EditorPanelProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  settings?: EditorSettings;
  onCursorPositionChange?: (lineNumber: number, column: number) => void;
  onEditorMount?: (editor: monacoEditor.IStandaloneCodeEditor) => void;
}

export default function EditorPanel({
  language,
  value,
  onChange,
  readOnly = false,
  settings: propSettings,
  onCursorPositionChange,
  onEditorMount,
}: EditorPanelProps) {
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);
  const vimModeRef = useRef<{ dispose: () => void } | null>(null);
  const [vimStatusBarRef, setVimStatusBarRef] = useState<HTMLDivElement | null>(null);
  const settings = propSettings || getEditorSettings();

  // Register custom themes before Monaco mounts
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    registerCustomThemes(monaco);
  }, []);

  // Editor mounted
  const handleMount: OnMount = useCallback(
    (editor) => {
      editorRef.current = editor;
      onEditorMount?.(editor);

      // Cursor position tracking (throttled)
      if (onCursorPositionChange) {
        let lastEmit = 0;
        editor.onDidChangeCursorPosition((e) => {
          const now = Date.now();
          if (now - lastEmit < 100) return;
          lastEmit = now;
          onCursorPositionChange(e.position.lineNumber, e.position.column);
        });
      }
    },
    [onCursorPositionChange, onEditorMount]
  );

  // Handle vim mode toggle
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (settings.keybindings === "vim" && vimStatusBarRef) {
      // Dynamically import monaco-vim
      import("monaco-vim").then(({ initVimMode }) => {
        // Dispose previous vim mode if any
        vimModeRef.current?.dispose();
        vimModeRef.current = initVimMode(editor, vimStatusBarRef);
      }).catch(() => {
        console.warn("Failed to load monaco-vim");
      });
    } else {
      // Dispose vim mode
      vimModeRef.current?.dispose();
      vimModeRef.current = null;
    }

    return () => {
      vimModeRef.current?.dispose();
      vimModeRef.current = null;
    };
  }, [settings.keybindings, vimStatusBarRef]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={(v) => onChange(v || "")}
          theme={settings.theme}
          beforeMount={handleBeforeMount}
          onMount={handleMount}
          options={{
            fontSize: settings.fontSize,
            fontFamily: "var(--font-geist-mono), monospace",
            minimap: { enabled: settings.minimap },
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: settings.cursorBlinking,
            renderLineHighlight: "all",
            lineNumbers: settings.lineNumbers,
            tabSize: settings.tabSize,
            wordWrap: settings.wordWrap,
            automaticLayout: true,
            readOnly,
            bracketPairColorization: {
              enabled: settings.bracketPairColorization,
            },
          }}
        />
      </div>

      {/* Vim status bar */}
      {settings.keybindings === "vim" && (
        <div
          ref={setVimStatusBarRef}
          className="shrink-0 h-6 bg-editor-surface border-t border-editor-border px-3 flex items-center text-xs font-mono text-gray-400"
        />
      )}
    </div>
  );
}
