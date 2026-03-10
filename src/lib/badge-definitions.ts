export interface BadgeDefinition {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: "STREAK" | "MILESTONE" | "SKILL" | "SPECIAL";
  threshold: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ─── STREAK badges ────────────────────────────────────────────────────────
  {
    slug: "fire-starter",
    name: "Fire Starter",
    description: "Maintain a 3-day practice streak",
    icon: "🔥",
    category: "STREAK",
    threshold: 3,
  },
  {
    slug: "week-warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day practice streak",
    icon: "⚔️",
    category: "STREAK",
    threshold: 7,
  },
  {
    slug: "monthly-machine",
    name: "Monthly Machine",
    description: "Maintain a 30-day practice streak",
    icon: "🤖",
    category: "STREAK",
    threshold: 30,
  },
  {
    slug: "century-club",
    name: "Century Club",
    description: "Maintain a 100-day practice streak",
    icon: "💯",
    category: "STREAK",
    threshold: 100,
  },

  // ─── MILESTONE badges ─────────────────────────────────────────────────────
  {
    slug: "first-blood",
    name: "First Blood",
    description: "Solve your first practice problem",
    icon: "🎯",
    category: "MILESTONE",
    threshold: 1,
  },
  {
    slug: "ten-down",
    name: "Ten Down",
    description: "Solve 10 practice problems",
    icon: "🏅",
    category: "MILESTONE",
    threshold: 10,
  },
  {
    slug: "half-century",
    name: "Half Century",
    description: "Solve 50 practice problems",
    icon: "⭐",
    category: "MILESTONE",
    threshold: 50,
  },
  {
    slug: "century",
    name: "Century",
    description: "Solve 100 practice problems",
    icon: "🏆",
    category: "MILESTONE",
    threshold: 100,
  },
  {
    slug: "problem-machine",
    name: "Problem Machine",
    description: "Solve 500 practice problems",
    icon: "👑",
    category: "MILESTONE",
    threshold: 500,
  },

  // ─── SKILL badges ─────────────────────────────────────────────────────────
  {
    slug: "easy-ace",
    name: "Easy Ace",
    description: "Solve 25 easy problems",
    icon: "🟢",
    category: "SKILL",
    threshold: 25,
  },
  {
    slug: "medium-master",
    name: "Medium Master",
    description: "Solve 25 medium problems",
    icon: "🟡",
    category: "SKILL",
    threshold: 25,
  },
  {
    slug: "hard-hitter",
    name: "Hard Hitter",
    description: "Solve 10 hard problems",
    icon: "🔴",
    category: "SKILL",
    threshold: 10,
  },
  {
    slug: "polyglot",
    name: "Polyglot",
    description: "Solve problems in 3 different languages",
    icon: "🌐",
    category: "SKILL",
    threshold: 3,
  },

  // ─── SPECIAL badges ───────────────────────────────────────────────────────
  {
    slug: "speed-demon",
    name: "Speed Demon",
    description: "Solve a problem in under 5 minutes",
    icon: "⚡",
    category: "SPECIAL",
    threshold: 1,
  },
  {
    slug: "night-owl",
    name: "Night Owl",
    description: "Solve a problem between midnight and 5 AM",
    icon: "🦉",
    category: "SPECIAL",
    threshold: 1,
  },
  {
    slug: "daily-devotee",
    name: "Daily Devotee",
    description: "Complete 10 daily challenges",
    icon: "📅",
    category: "SPECIAL",
    threshold: 10,
  },
];
