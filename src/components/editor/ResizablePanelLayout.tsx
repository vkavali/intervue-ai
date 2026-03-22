"use client";

import { useState, useRef, useCallback, useEffect, ReactNode } from "react";

interface PanelSizes {
  leftWidth: number;
  rightWidth: number;
  bottomHeight: number;
}

interface ResizablePanelLayoutProps {
  storageKey?: string;
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel?: ReactNode;
  bottomPanel?: ReactNode;
  showLeft?: boolean;
  showRight?: boolean;
  showBottom?: boolean;
  leftMin?: number;
  leftMax?: number;
  rightMin?: number;
  rightMax?: number;
  bottomMin?: number;
  bottomMax?: number;
  defaultLeftWidth?: number;
  defaultRightWidth?: number;
  defaultBottomHeight?: number;
  className?: string;
}

function loadSizes(key: string, defaults: PanelSizes): PanelSizes {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    }
  } catch {}
  return defaults;
}

function saveSizes(key: string, sizes: PanelSizes) {
  try {
    localStorage.setItem(key, JSON.stringify(sizes));
  } catch {}
}

export default function ResizablePanelLayout({
  storageKey = "printf-panel-sizes",
  leftPanel,
  centerPanel,
  rightPanel,
  bottomPanel,
  showLeft = true,
  showRight = true,
  showBottom = false,
  leftMin = 200,
  leftMax = 500,
  rightMin = 200,
  rightMax = 500,
  bottomMin = 100,
  bottomMax = 500,
  defaultLeftWidth = 320,
  defaultRightWidth = 320,
  defaultBottomHeight = 280,
  className = "",
}: ResizablePanelLayoutProps) {
  const [sizes, setSizes] = useState<PanelSizes>(() =>
    loadSizes(storageKey, {
      leftWidth: defaultLeftWidth,
      rightWidth: defaultRightWidth,
      bottomHeight: defaultBottomHeight,
    })
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"left" | "right" | "bottom" | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startSize = useRef(0);

  const handleMouseDown = useCallback(
    (panel: "left" | "right" | "bottom", e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = panel;
      startX.current = e.clientX;
      startY.current = e.clientY;
      if (panel === "left") startSize.current = sizes.leftWidth;
      else if (panel === "right") startSize.current = sizes.rightWidth;
      else startSize.current = sizes.bottomHeight;

      document.body.style.cursor = panel === "bottom" ? "row-resize" : "col-resize";
      document.body.style.userSelect = "none";
    },
    [sizes]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;

      if (dragging.current === "left") {
        const delta = e.clientX - startX.current;
        const newWidth = Math.min(leftMax, Math.max(leftMin, startSize.current + delta));
        setSizes((prev) => ({ ...prev, leftWidth: newWidth }));
      } else if (dragging.current === "right") {
        const delta = startX.current - e.clientX;
        const newWidth = Math.min(rightMax, Math.max(rightMin, startSize.current + delta));
        setSizes((prev) => ({ ...prev, rightWidth: newWidth }));
      } else if (dragging.current === "bottom") {
        const delta = startY.current - e.clientY;
        const newHeight = Math.min(bottomMax, Math.max(bottomMin, startSize.current + delta));
        setSizes((prev) => ({ ...prev, bottomHeight: newHeight }));
      }
    };

    const handleMouseUp = () => {
      if (dragging.current) {
        dragging.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        setSizes((prev) => {
          saveSizes(storageKey, prev);
          return prev;
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [storageKey, leftMin, leftMax, rightMin, rightMax, bottomMin, bottomMax]);

  const dividerClasses =
    "shrink-0 bg-transparent hover:bg-blue-500/30 active:bg-blue-500/50 transition-colors duration-150";

  return (
    <div ref={containerRef} className={`flex flex-1 overflow-hidden ${className}`}>
      {/* Left Panel */}
      {showLeft && (
        <>
          <div
            className="shrink-0 overflow-hidden"
            style={{ width: sizes.leftWidth }}
          >
            {leftPanel}
          </div>
          <div
            className={`${dividerClasses} cursor-col-resize w-[4px]`}
            onMouseDown={(e) => handleMouseDown("left", e)}
          />
        </>
      )}

      {/* Center + Bottom */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Center Panel */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {centerPanel}
        </div>

        {/* Bottom Divider + Panel */}
        {showBottom && bottomPanel && (
          <>
            <div
              className={`${dividerClasses} cursor-row-resize h-[4px]`}
              onMouseDown={(e) => handleMouseDown("bottom", e)}
            />
            <div
              className="shrink-0 overflow-hidden"
              style={{ height: sizes.bottomHeight }}
            >
              {bottomPanel}
            </div>
          </>
        )}
      </div>

      {/* Right Panel */}
      {showRight && rightPanel && (
        <>
          <div
            className={`${dividerClasses} cursor-col-resize w-[4px]`}
            onMouseDown={(e) => handleMouseDown("right", e)}
          />
          <div
            className="shrink-0 overflow-hidden"
            style={{ width: sizes.rightWidth }}
          >
            {rightPanel}
          </div>
        </>
      )}
    </div>
  );
}
