"use client";

import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";

interface CarouselProps {
  children: ReactNode;
  className?: string;
  autoScrollSpeed?: number; // pixels per frame (~60fps), default 0.5
  cardGap?: number; // gap in px, default 20
}

export default function Carousel({
  children,
  className = "",
  autoScrollSpeed = 0.5,
  cardGap = 20,
}: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const animRef = useRef<number | null>(null);

  const updateButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let direction = 1; // 1 = right, -1 = left

    function tick() {
      if (!isPaused && el) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        el.scrollLeft += autoScrollSpeed * direction;

        if (el.scrollLeft >= maxScroll - 1) {
          direction = -1;
        } else if (el.scrollLeft <= 1) {
          direction = 1;
        }
        updateButtons();
      }
      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPaused, autoScrollSpeed, updateButtons]);

  // Update button states on resize
  useEffect(() => {
    updateButtons();
    window.addEventListener("resize", updateButtons);
    return () => window.removeEventListener("resize", updateButtons);
  }, [updateButtons]);

  function scrollBy(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    // Scroll by roughly one card width + gap
    const scrollAmount = 300 + cardGap;
    el.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
    setTimeout(updateButtons, 350);
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left Arrow */}
      <button
        onClick={() => scrollBy("left")}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all ${
          canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Scroll left"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onScroll={updateButtons}
        className={`flex overflow-x-auto scrollbar-none ${className}`}
        style={{ gap: `${cardGap}px` }}
      >
        {children}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scrollBy("right")}
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all ${
          canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Scroll right"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
