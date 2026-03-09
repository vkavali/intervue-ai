"use client";

/**
 * Aurora background with floating frosted-glass geometric shapes.
 * Pure CSS — no Three.js, no text labels. Just light and geometry.
 */
export default function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* ── Aurora gradient blobs ── */}
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />

      {/* ── Frosted glass shapes ── */}
      {/* Hexagons */}
      <div className="glass-shape glass-hex" style={{ left: "8%", top: "15%", animationDelay: "0s" }} />
      <div className="glass-shape glass-hex" style={{ left: "85%", top: "25%", animationDelay: "-8s", animationDuration: "28s" }} />
      <div className="glass-shape glass-hex glass-sm" style={{ left: "45%", top: "70%", animationDelay: "-4s" }} />
      <div className="glass-shape glass-hex glass-sm" style={{ left: "72%", top: "82%", animationDelay: "-15s", animationDuration: "32s" }} />

      {/* Diamonds */}
      <div className="glass-shape glass-diamond" style={{ left: "75%", top: "12%", animationDelay: "-6s" }} />
      <div className="glass-shape glass-diamond" style={{ left: "20%", top: "75%", animationDelay: "-12s", animationDuration: "30s" }} />
      <div className="glass-shape glass-diamond glass-sm" style={{ left: "55%", top: "20%", animationDelay: "-3s" }} />
      <div className="glass-shape glass-diamond glass-sm" style={{ left: "30%", top: "55%", animationDelay: "-18s", animationDuration: "26s" }} />

      {/* Circles */}
      <div className="glass-shape glass-circle" style={{ left: "15%", top: "45%", animationDelay: "-10s" }} />
      <div className="glass-shape glass-circle" style={{ left: "65%", top: "55%", animationDelay: "-2s", animationDuration: "34s" }} />
      <div className="glass-shape glass-circle glass-sm" style={{ left: "90%", top: "65%", animationDelay: "-14s" }} />
      <div className="glass-shape glass-circle glass-sm" style={{ left: "40%", top: "10%", animationDelay: "-7s", animationDuration: "22s" }} />

      {/* Rounded squares */}
      <div className="glass-shape glass-square" style={{ left: "50%", top: "40%", animationDelay: "-5s" }} />
      <div className="glass-shape glass-square glass-sm" style={{ left: "5%", top: "85%", animationDelay: "-16s", animationDuration: "28s" }} />
      <div className="glass-shape glass-square glass-sm" style={{ left: "92%", top: "45%", animationDelay: "-11s" }} />
      <div className="glass-shape glass-square" style={{ left: "35%", top: "88%", animationDelay: "-20s", animationDuration: "36s" }} />

      {/* ── Tiny glowing dots (star-like) ── */}
      {Array.from({ length: 30 }).map((_, i) => {
        const seed1 = Math.sin(i * 127.1 + 311.7) * 43758.5453;
        const seed2 = Math.sin(i * 269.5 + 183.3) * 43758.5453;
        const left = ((seed1 - Math.floor(seed1)) * 96 + 2);
        const top = ((seed2 - Math.floor(seed2)) * 96 + 2);
        const colors = ["bg-purple-400", "bg-blue-400", "bg-cyan-400", "bg-violet-400", "bg-indigo-400"];
        return (
          <div
            key={i}
            className={`absolute rounded-full ${colors[i % 5]}`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: i % 3 === 0 ? "3px" : "2px",
              height: i % 3 === 0 ? "3px" : "2px",
              opacity: 0.3 + (i % 4) * 0.1,
              animation: `starPulse ${3 + (i % 4) * 2}s ease-in-out ${-(i * 0.7)}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
