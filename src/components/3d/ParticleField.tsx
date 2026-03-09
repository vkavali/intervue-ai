"use client";

import { useMemo } from "react";

interface FloatingItem {
  label: string;
  color: string;
  bg: string;
  border: string;
  size: "sm" | "md" | "lg";
  type: "badge" | "icon" | "dot";
}

const floatingItems: FloatingItem[] = [
  // Languages
  { label: "Python", color: "text-yellow-300", bg: "bg-yellow-500/10", border: "border-yellow-500/20", size: "md", type: "badge" },
  { label: "Java", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", size: "md", type: "badge" },
  { label: "JavaScript", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", size: "md", type: "badge" },
  { label: "TypeScript", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", size: "md", type: "badge" },
  { label: "Go", color: "text-cyan-300", bg: "bg-cyan-500/10", border: "border-cyan-500/20", size: "sm", type: "badge" },
  { label: "Rust", color: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/20", size: "sm", type: "badge" },
  { label: "C++", color: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/20", size: "sm", type: "badge" },
  { label: "SQL", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", size: "sm", type: "badge" },
  { label: "React", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", size: "sm", type: "badge" },
  { label: "Node.js", color: "text-green-300", bg: "bg-green-500/10", border: "border-green-500/20", size: "sm", type: "badge" },
  // HR / interview concepts
  { label: "HIRE", color: "text-green-400", bg: "bg-green-500/15", border: "border-green-500/25", size: "lg", type: "badge" },
  { label: "Score: 92", color: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-500/20", size: "md", type: "badge" },
  { label: "AI Audit", color: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/20", size: "md", type: "badge" },
  { label: "Resume", color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20", size: "sm", type: "badge" },
  { label: "L3", color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/25", size: "sm", type: "badge" },
  { label: "Pipeline", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", size: "sm", type: "badge" },
  { label: "Interview", color: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/20", size: "sm", type: "badge" },
  { label: "Offer Letter", color: "text-green-300", bg: "bg-green-500/10", border: "border-green-500/20", size: "sm", type: "badge" },
  // Tech / code concepts
  { label: "</>", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", size: "md", type: "icon" },
  { label: "API", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", size: "sm", type: "badge" },
  { label: "O(n)", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", size: "sm", type: "badge" },
  { label: "BFS", color: "text-teal-300", bg: "bg-teal-500/10", border: "border-teal-500/20", size: "sm", type: "badge" },
  { label: "DP", color: "text-indigo-300", bg: "bg-indigo-500/10", border: "border-indigo-500/20", size: "sm", type: "badge" },
  { label: "HashMap", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", size: "sm", type: "badge" },
  { label: "Graph", color: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/20", size: "sm", type: "badge" },
  // Accent dots scattered everywhere
  { label: "", color: "", bg: "bg-purple-500", border: "", size: "sm", type: "dot" },
  { label: "", color: "", bg: "bg-blue-500", border: "", size: "sm", type: "dot" },
  { label: "", color: "", bg: "bg-cyan-500", border: "", size: "sm", type: "dot" },
  { label: "", color: "", bg: "bg-violet-500", border: "", size: "sm", type: "dot" },
  { label: "", color: "", bg: "bg-purple-400", border: "", size: "sm", type: "dot" },
  { label: "", color: "", bg: "bg-blue-400", border: "", size: "sm", type: "dot" },
  { label: "", color: "", bg: "bg-pink-500", border: "", size: "sm", type: "dot" },
  { label: "", color: "", bg: "bg-cyan-400", border: "", size: "sm", type: "dot" },
  { label: "", color: "", bg: "bg-indigo-400", border: "", size: "sm", type: "dot" },
  { label: "", color: "", bg: "bg-emerald-500", border: "", size: "sm", type: "dot" },
  { label: "", color: "", bg: "bg-purple-300", border: "", size: "sm", type: "dot" },
  { label: "", color: "", bg: "bg-blue-300", border: "", size: "sm", type: "dot" },
  { label: "", color: "", bg: "bg-violet-400", border: "", size: "sm", type: "dot" },
  { label: "", color: "", bg: "bg-teal-400", border: "", size: "sm", type: "dot" },
  { label: "", color: "", bg: "bg-rose-400", border: "", size: "sm", type: "dot" },
  { label: "", color: "", bg: "bg-amber-400", border: "", size: "sm", type: "dot" },
];

// Seeded pseudo-random for deterministic layout
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export default function ParticleField() {
  const items = useMemo(() => {
    return floatingItems.map((item, i) => {
      // Distribute across the full area with seeded randomness
      const left = seededRandom(i * 7 + 1) * 90 + 2;
      const top = seededRandom(i * 13 + 3) * 90 + 2;
      const duration = 18 + seededRandom(i * 3 + 5) * 22;
      const delay = seededRandom(i * 11 + 7) * -30;
      const driftX = 15 + seededRandom(i * 5 + 9) * 40;
      const driftY = 10 + seededRandom(i * 9 + 2) * 30;

      return { ...item, left, top, duration, delay, driftX, driftY, id: i };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((item) => {
        if (item.type === "dot") {
          return (
            <div
              key={item.id}
              className={`absolute w-1.5 h-1.5 rounded-full ${item.bg} opacity-30`}
              style={{
                left: `${item.left}%`,
                top: `${item.top}%`,
                animation: `floatDrift${item.id % 4} ${item.duration}s ease-in-out ${item.delay}s infinite`,
              }}
            />
          );
        }

        const sizeClass =
          item.size === "lg"
            ? "px-3 py-1.5 text-xs"
            : item.size === "md"
            ? "px-2.5 py-1 text-[10px]"
            : "px-2 py-0.5 text-[9px]";

        return (
          <div
            key={item.id}
            className={`absolute rounded-full border backdrop-blur-sm font-mono font-semibold whitespace-nowrap ${sizeClass} ${item.color} ${item.bg} ${item.border} opacity-40 select-none`}
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
              animation: `floatDrift${item.id % 4} ${item.duration}s ease-in-out ${item.delay}s infinite`,
            }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
}
