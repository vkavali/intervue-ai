"use client";

import { useState, useRef, useEffect } from "react";

interface AIMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AIPanelProps {
  messages: AIMessage[];
  currentAiLevel: number;
  aiLevelLabels: Record<number, { label: string; color: string }>;
  onSubmit: (prompt: string) => void;
  loading: boolean;
  disabled: boolean;
  disabledReason?: string;
}

export default function AIPanel({
  messages,
  currentAiLevel,
  aiLevelLabels,
  onSubmit,
  loading,
  disabled,
  disabledReason,
}: AIPanelProps) {
  const [prompt, setPrompt] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading || disabled) return;
    onSubmit(prompt);
    setPrompt("");
  }

  return (
    <div className="h-full flex flex-col border-l border-editor-border bg-editor-panel/80">
      <div className="border-b border-editor-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
          <span className={`text-xs font-medium ${aiLevelLabels[currentAiLevel]?.color || "text-gray-400"}`}>
            {aiLevelLabels[currentAiLevel]?.label}
          </span>
        </div>
        {currentAiLevel === 0 && (
          <p className="text-xs text-red-400 mt-1">AI assistance is disabled for this question.</p>
        )}
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && currentAiLevel > 0 && (
          <div className="text-center py-8">
            <svg className="mx-auto h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="mt-2 text-xs text-gray-500">Ask the AI for help with your solution.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
              msg.role === "user"
                ? "bg-saffron/20 text-saffron-light border border-saffron/30"
                : "bg-editor-surface text-gray-300 border border-editor-border"
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <span className="block mt-1 text-[10px] text-gray-500">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-editor-surface border border-editor-border px-3 py-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-editor-border p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={disabled}
            placeholder={disabledReason || "Ask the AI for help..."}
            className="flex-1 rounded-lg border border-editor-border bg-editor-surface px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || loading || !prompt.trim()}
            className="rounded-lg border border-saffron bg-transparent px-3 py-2 text-sm font-medium text-saffron hover:bg-saffron/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
