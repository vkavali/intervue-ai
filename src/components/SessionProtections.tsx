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
  const [violations, setViolations] = useState<Violation[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSeverity, setModalSeverity] = useState<"warning" | "severe" | "critical">("warning");
  const violationCountRef = useRef(0);

  const getWarningLevel = useCallback((count: number): { severity: "warning" | "severe" | "critical"; message: string } => {
    if (count >= 5) {
      return {
        severity: "critical",
        message: "This is your final warning. Continued violations may result in session termination. Your interviewer has been notified of all violations.",
      };
    }
    if (count >= 3) {
      return {
        severity: "severe",
        message: "Multiple violations have been detected and logged. Your interviewer can see all violation activity. Please refrain from any further violations.",
      };
    }
    return {
      severity: "warning",
      message: "This action has been blocked and logged. All activity during the interview is monitored and recorded.",
    };
  }, []);

  const logViolation = useCallback((type: string) => {
    const violation = { type, timestamp: new Date().toISOString() };
    setViolations(prev => [...prev, violation]);
    violationCountRef.current += 1;

    // Show modal with escalating severity
    const { severity, message } = getWarningLevel(violationCountRef.current);
    setModalSeverity(severity);

    const typeLabel = type.replace(/_/g, " ").replace(/\d+$/, "").trim();
    setModalMessage(`${typeLabel} detected. ${message}`);
    setShowModal(true);

    // Send to server (best effort)
    fetch(`/api/sessions/${sessionId}/violations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(violation),
    }).catch(() => {});
  }, [sessionId, getWarningLevel]);

  useEffect(() => {
    if (isPractice) return;

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

    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
      logViolation("RIGHT_CLICK");
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "c" || e.key === "v" || e.key === "x") {
          e.preventDefault();
          logViolation(`KEYBOARD_${e.key.toUpperCase()}`);
        }
      }
    }

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

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "You have an active interview session. Are you sure you want to leave?";
      return e.returnValue;
    }

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
    };
  }, [isPractice, logViolation]);

  if (isPractice) return null;

  const severityStyles = {
    warning: {
      border: "border-yellow-500/50",
      bg: "bg-yellow-900/95",
      icon: "text-yellow-400",
      title: "text-yellow-300",
      text: "text-yellow-200",
      button: "bg-yellow-600 hover:bg-yellow-500",
    },
    severe: {
      border: "border-orange-500/50",
      bg: "bg-orange-900/95",
      icon: "text-orange-400",
      title: "text-orange-300",
      text: "text-orange-200",
      button: "bg-orange-600 hover:bg-orange-500",
    },
    critical: {
      border: "border-red-500/50",
      bg: "bg-red-900/95",
      icon: "text-red-400",
      title: "text-red-300",
      text: "text-red-200",
      button: "bg-red-600 hover:bg-red-500",
    },
  };

  const styles = severityStyles[modalSeverity];

  return (
    <>
      {/* Violation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className={`rounded-2xl border ${styles.border} ${styles.bg} p-6 max-w-md mx-4 shadow-2xl`}>
            <div className="flex items-center gap-3 mb-4">
              <svg className={`w-8 h-8 ${styles.icon} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className={`text-lg font-bold ${styles.title}`}>
                {modalSeverity === "critical" ? "Final Warning" : modalSeverity === "severe" ? "Severe Warning" : "Warning"}
              </h3>
            </div>

            <p className={`text-sm ${styles.text} mb-6 leading-relaxed`}>
              {modalMessage}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Violations: {violations.length}
              </span>
              <button
                onClick={() => setShowModal(false)}
                className={`rounded-lg ${styles.button} px-6 py-2 text-sm font-semibold text-white transition-colors`}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Switch Counter (top bar indicator) */}
      {tabSwitchCount > 0 && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-40">
          <div className={`rounded-full border px-3 py-1 text-xs font-medium flex items-center gap-2 ${
            tabSwitchCount >= 5
              ? "border-red-500/50 bg-red-900/80 text-red-300"
              : tabSwitchCount >= 3
              ? "border-orange-500/50 bg-orange-900/80 text-orange-300"
              : "border-yellow-500/30 bg-yellow-900/80 text-yellow-300"
          } backdrop-blur-sm`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Tab switches: {tabSwitchCount}
          </div>
        </div>
      )}
    </>
  );
}
