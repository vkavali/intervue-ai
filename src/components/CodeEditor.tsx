"use client"

import { useState } from "react"
import Editor from "@monaco-editor/react"

const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
] as const

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["value"]

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: SupportedLanguage
  readOnly?: boolean
  height?: string
}

export default function CodeEditor({
  value,
  onChange,
  language = "javascript",
  readOnly = false,
  height = "500px",
}: CodeEditorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(language)

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-700">
      {/* Language selector toolbar */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <label className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
            disabled={readOnly}
            className="rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>

        {readOnly && (
          <span className="rounded bg-yellow-600/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
            Read Only
          </span>
        )}
      </div>

      {/* Monaco Editor */}
      <Editor
        height={height}
        language={selectedLanguage}
        value={value}
        theme="vs-dark"
        onChange={(val) => onChange(val ?? "")}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 12 },
          suggestOnTriggerCharacters: !readOnly,
          quickSuggestions: readOnly ? false : undefined,
        }}
        loading={
          <div className="flex items-center justify-center bg-gray-900" style={{ height }}>
            <div className="text-sm text-gray-400">Loading editor...</div>
          </div>
        }
      />
    </div>
  )
}
