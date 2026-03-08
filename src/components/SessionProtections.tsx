"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface SessionProtectionsProps {
  sessionId: string;
  isPractice?: boolean;
}

interface Violation {
  type: string;
  timestamp: string;
}

export default function SessionProtections({ sessionId, isPractice = false }: SessionProtectionsProps) {
  const [, setViolations] = useState<Violation[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const logViolation = useCallback((type: string) => {
    const violation = { type, timestamp: new Date().toISOString() };
    setViolations(prev => [...prev, violation]);

    // Show warning banner
    setShowWarning(true);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    warningTimeoutRef.current = setTimeout(() => setShowWarning(false), 3000);

    // Send to server (best effort)
    fetch(`/api/sessions/${sessionId}/violations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(violation),
    }).catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    if (isPractice) return; // No protections in practice mode

    // --- Copy/Paste Prevention ---
    function handleCopy(e: ClipboardEvent) {
      e.preventDefault();
      logViolation("COPY_ATTEMPT");
    }

    function handlePaste(e: ClipboardEvent) {
      e.preventDefault();
      logViolation("PASTE_ATTEMPT");
    }

    function handleCut(e: ClipboardEvent) {
      e.preventDefault();
      logViolation("CUT_ATTEMPT");
    }

    // --- Right-click Prevention ---
    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
      logViolation("RIGHT_CLICK");
    }

    // --- Keyboard shortcut prevention ---
    function handleKeyDown(e: KeyboardEvent) {
      // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Shift+V
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "c" || e.key === "v" || e.key === "x") {
          e.preventDefault();
          logViolation(`KEYBOARD_${e.key.toUpperCase()}`);
        }
      }
    }

    // --- Tab Visibility / Focus Detection ---
    function handleVisibilityChange() {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          logViolation(`TAB_SWITCH_${newCount}`);
          return newCount;
        });
      }
    }

    function handleBlur() {
      logViolation("WINDOW_BLUR");
    }

    // --- Navigation Prevention ---
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "You have an active interview session. Are you sure you want to leave?";
      return e.returnValue;
    }

    // Add event listeners
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [isPractice, logViolation]);

  if (isPractice) return null;

  return (
    <>
      {/* Warning Banner */}
      {showWarning && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="rounded-lg border border-red-500/30 bg-red-900/90 backdrop-blur-sm px-4 py-2 shadow-lg flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-red-200">Action blocked - this activity is monitored</span>
          </div>
        </div>
      )}

      {/* Tab Switch Counter (small indicator) */}
      {tabSwitchCount > 0 && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/80 backdrop-blur-sm px-3 py-1.5 text-xs text-yellow-300">
            Tab switches: {tabSwitchCount}
          </div>
        </div>
      )}
    </>
  );
}
