"use client";

import { useState } from "react";
import BadgeCard from "./BadgeCard";

interface BadgeData {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
}

interface BadgeGridProps {
  badges: BadgeData[];
}

const CATEGORIES = [
  { key: "ALL", label: "All" },
  { key: "STREAK", label: "Streak" },
  { key: "MILESTONE", label: "Milestone" },
  { key: "SKILL", label: "Skill" },
  { key: "SPECIAL", label: "Special" },
];

export default function BadgeGrid({ badges }: BadgeGridProps) {
  const [activeCategory, setActiveCategory] = useState("ALL");

  const filtered =
    activeCategory === "ALL"
      ? badges
      : badges.filter((b) => b.category === activeCategory);

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => {
            const count =
              cat.key === "ALL"
                ? badges.length
                : badges.filter((b) => b.category === cat.key).length;
            const earnedInCat =
              cat.key === "ALL"
                ? earnedCount
                : badges.filter((b) => b.category === cat.key && b.earned).length;

            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === cat.key
                    ? "bg-saffron/10 text-saffron-dark border border-saffron/30"
                    : "bg-gray-100 text-gray-500 border border-transparent hover:bg-gray-200"
                }`}
              >
                {cat.label}
                <span className="ml-1 text-[10px] opacity-70">
                  {earnedInCat}/{count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered
          .sort((a, b) => (a.earned === b.earned ? 0 : a.earned ? -1 : 1))
          .map((badge) => (
            <BadgeCard key={badge.slug} {...badge} />
          ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">No badges in this category yet.</p>
        </div>
      )}
    </div>
  );
}
