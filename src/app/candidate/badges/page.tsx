"use client";

import { useEffect, useState } from "react";
import BadgeGrid from "@/components/gamification/BadgeGrid";
import { BADGE_DEFINITIONS } from "@/lib/badge-definitions";

interface EarnedBadge {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earnedAt: string;
}

export default function BadgesPage() {
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gamification/stats")
      .then((r) => (r.ok ? r.json() : { badges: [] }))
      .then((data) => {
        setEarnedBadges(data.badges || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const earnedSlugs = new Set(earnedBadges.map((b) => b.slug));

  const allBadges = BADGE_DEFINITIONS.map((def) => {
    const earned = earnedBadges.find((b) => b.slug === def.slug);
    return {
      slug: def.slug,
      name: def.name,
      description: def.description,
      icon: def.icon,
      category: def.category,
      earned: earnedSlugs.has(def.slug),
      earnedAt: earned?.earnedAt,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-8 w-8 border-2 border-saffron border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Badge Collection</h1>
        <p className="mt-1 text-gray-500">
          Earn badges by solving problems, maintaining streaks, and completing challenges.
          {" "}
          <span className="font-medium text-saffron">{earnedBadges.length}/{BADGE_DEFINITIONS.length}</span> earned.
        </p>
      </div>

      <BadgeGrid badges={allBadges} />
    </div>
  );
}
