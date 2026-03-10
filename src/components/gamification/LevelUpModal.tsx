"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface LevelUpModalProps {
  newLevel: number;
  xp: number;
  newBadges?: Array<{ name: string; icon: string }>;
  onClose: () => void;
}

export default function LevelUpModal({ newLevel, xp, newBadges, onClose }: LevelUpModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    // Fire confetti
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#FF9933", "#138808", "#FFD700"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#FF9933", "#138808", "#FFD700"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={`relative z-10 rounded-2xl border border-saffron/30 bg-white p-8 text-center shadow-xl transition-transform duration-300 ${
          visible ? "scale-100" : "scale-90"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Level Up!</h2>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-saffron/10 text-xl font-bold text-saffron">
            {newLevel}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          You&apos;ve reached Level {newLevel} with {xp.toLocaleString()} XP!
        </p>

        {newBadges && newBadges.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-2">Badges Earned</p>
            <div className="flex items-center justify-center gap-3">
              {newBadges.map((badge) => (
                <div key={badge.name} className="flex items-center gap-1.5 rounded-full bg-saffron/10 px-3 py-1">
                  <span>{badge.icon}</span>
                  <span className="text-xs font-medium text-saffron-dark">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="mt-6 rounded-lg border border-saffron bg-transparent px-6 py-2 text-sm font-medium text-saffron hover:bg-saffron/10 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
