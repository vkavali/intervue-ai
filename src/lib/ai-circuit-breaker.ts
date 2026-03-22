/**
 * AI Circuit Breaker — tracks daily AI spend and blocks calls when budget exceeded.
 * Uses Upstash Redis for persistence. Falls back to in-memory when Redis unavailable.
 */
import { redis } from './redis'

// Default: $5/day (500 cents). Override via env.
const DAILY_AI_BUDGET_CENTS = parseInt(process.env.DAILY_AI_BUDGET_CENTS || '500')

// Approximate cost per 1K tokens (Claude Sonnet 4)
const COST_PER_1K_INPUT = 0.3    // cents
const COST_PER_1K_OUTPUT = 1.5   // cents

// In-memory fallback when Redis not available
let memorySpentCents = 0
let memoryDate = ''

function todayKey(): string {
  return `ai-budget:${new Date().toISOString().split('T')[0]}`
}

function todayDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Check if AI calls are allowed under the daily budget.
 */
export async function checkAIBudget(): Promise<{ allowed: boolean; spentCents: number; limitCents: number }> {
  if (redis) {
    try {
      const spent = parseInt((await redis.get<string>(todayKey())) || '0')
      return {
        allowed: spent < DAILY_AI_BUDGET_CENTS,
        spentCents: spent,
        limitCents: DAILY_AI_BUDGET_CENTS,
      }
    } catch {
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  const today = todayDate()
  if (memoryDate !== today) {
    memoryDate = today
    memorySpentCents = 0
  }
  return {
    allowed: memorySpentCents < DAILY_AI_BUDGET_CENTS,
    spentCents: memorySpentCents,
    limitCents: DAILY_AI_BUDGET_CENTS,
  }
}

/**
 * Record token usage after an AI call completes.
 */
export async function recordAISpend(inputTokens: number, outputTokens: number): Promise<void> {
  const costCents = Math.ceil(
    (inputTokens / 1000) * COST_PER_1K_INPUT +
    (outputTokens / 1000) * COST_PER_1K_OUTPUT
  )

  if (redis) {
    try {
      const key = todayKey()
      await redis.incrby(key, costCents)
      await redis.expire(key, 172800) // 48h TTL
      return
    } catch {
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  const today = todayDate()
  if (memoryDate !== today) {
    memoryDate = today
    memorySpentCents = 0
  }
  memorySpentCents += costCents
}
