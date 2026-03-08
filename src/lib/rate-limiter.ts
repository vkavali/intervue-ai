/**
 * In-memory rate limiter with plan-based limits.
 * Uses sliding window counters per user/IP.
 */

// Plan-based limits (per day)
const PLAN_LIMITS: Record<string, {
  aiCalls: number;       // AI assist calls per day
  aiGenerations: number; // AI question generation per day
  practiceAi: number;    // Practice mode AI calls per day
}> = {
  STARTER: {
    aiCalls: 10,
    aiGenerations: 5,
    practiceAi: 15,
  },
  GROWTH: {
    aiCalls: 50,
    aiGenerations: 20,
    practiceAi: 50,
  },
  ENTERPRISE: {
    aiCalls: -1, // unlimited
    aiGenerations: -1,
    practiceAi: -1,
  },
  PAY_PER_INTERVIEW: {
    aiCalls: 100,
    aiGenerations: 30,
    practiceAi: 100,
  },
};

// Free tier limits (no company/plan)
const FREE_LIMITS = {
  aiCalls: 5,
  aiGenerations: 3,
  practiceAi: 10,
};

// Global IP rate limits (per minute)
const IP_RATE_LIMITS = {
  general: 60,       // 60 requests/minute for general API
  auth: 10,          // 10 login attempts/minute
  ai: 20,            // 20 AI requests/minute
};

// In-memory stores
interface RateEntry {
  count: number;
  windowStart: number;
}

const userDailyUsage: Map<string, Map<string, RateEntry>> = new Map();
const ipMinuteUsage: Map<string, Map<string, RateEntry>> = new Map();

// Cleanup old entries every 10 minutes
const CLEANUP_INTERVAL = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const dayAgo = now - 24 * 60 * 60 * 1000;
  const minuteAgo = now - 60 * 1000;

  for (const [key, actions] of Array.from(userDailyUsage.entries())) {
    for (const [action, entry] of Array.from(actions.entries())) {
      if (entry.windowStart < dayAgo) actions.delete(action);
    }
    if (actions.size === 0) userDailyUsage.delete(key);
  }

  for (const [key, actions] of Array.from(ipMinuteUsage.entries())) {
    for (const [action, entry] of Array.from(actions.entries())) {
      if (entry.windowStart < minuteAgo) actions.delete(action);
    }
    if (actions.size === 0) ipMinuteUsage.delete(key);
  }
}

function getOrCreateEntry(
  store: Map<string, Map<string, RateEntry>>,
  key: string,
  action: string,
  windowMs: number
): RateEntry {
  if (!store.has(key)) store.set(key, new Map());
  const actions = store.get(key)!;

  const now = Date.now();
  const existing = actions.get(action);

  if (!existing || now - existing.windowStart >= windowMs) {
    const entry = { count: 0, windowStart: now };
    actions.set(action, entry);
    return entry;
  }

  return existing;
}

export type RateLimitAction = "aiCalls" | "aiGenerations" | "practiceAi";

/**
 * Check and increment rate limit for a user based on their plan.
 * Returns { allowed, remaining, limit } or throws if blocked.
 */
export function checkUserRateLimit(
  userId: string,
  action: RateLimitAction,
  plan?: string | null
): { allowed: boolean; remaining: number; limit: number; resetIn: number } {
  cleanupStaleEntries();

  const limits = plan && PLAN_LIMITS[plan] ? PLAN_LIMITS[plan] : FREE_LIMITS;
  const limit = limits[action];

  // Unlimited
  if (limit === -1) {
    return { allowed: true, remaining: -1, limit: -1, resetIn: 0 };
  }

  const DAY_MS = 24 * 60 * 60 * 1000;
  const entry = getOrCreateEntry(userDailyUsage, userId, action, DAY_MS);

  if (entry.count >= limit) {
    const resetIn = Math.ceil((entry.windowStart + DAY_MS - Date.now()) / 1000);
    return { allowed: false, remaining: 0, limit, resetIn };
  }

  entry.count++;
  const remaining = limit - entry.count;
  const resetIn = Math.ceil((entry.windowStart + DAY_MS - Date.now()) / 1000);

  return { allowed: true, remaining, limit, resetIn };
}

export type IpRateLimitAction = "general" | "auth" | "ai";

/**
 * Check and increment rate limit for an IP address.
 * Returns { allowed, remaining, limit } or indicates blocked.
 */
export function checkIpRateLimit(
  ip: string,
  action: IpRateLimitAction
): { allowed: boolean; remaining: number; limit: number; retryAfter: number } {
  cleanupStaleEntries();

  const limit = IP_RATE_LIMITS[action];
  const MINUTE_MS = 60 * 1000;
  const entry = getOrCreateEntry(ipMinuteUsage, ip, action, MINUTE_MS);

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.windowStart + MINUTE_MS - Date.now()) / 1000);
    return { allowed: false, remaining: 0, limit, retryAfter };
  }

  entry.count++;
  const remaining = limit - entry.count;
  const retryAfter = Math.ceil((entry.windowStart + MINUTE_MS - Date.now()) / 1000);

  return { allowed: true, remaining, limit, retryAfter };
}

/**
 * Get current usage stats for a user (for display in UI).
 */
export function getUserUsageStats(
  userId: string,
  plan?: string | null
): Record<RateLimitAction, { used: number; limit: number }> {
  const limits = plan && PLAN_LIMITS[plan] ? PLAN_LIMITS[plan] : FREE_LIMITS;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const stats: Record<RateLimitAction, { used: number; limit: number }> = {
    aiCalls: { used: 0, limit: limits.aiCalls },
    aiGenerations: { used: 0, limit: limits.aiGenerations },
    practiceAi: { used: 0, limit: limits.practiceAi },
  };

  const actions = userDailyUsage.get(userId);
  if (actions) {
    for (const action of ["aiCalls", "aiGenerations", "practiceAi"] as RateLimitAction[]) {
      const entry = actions.get(action);
      if (entry && now - entry.windowStart < DAY_MS) {
        stats[action].used = entry.count;
      }
    }
  }

  return stats;
}
