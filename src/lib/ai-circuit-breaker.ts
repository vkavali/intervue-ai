/**
 * AI Circuit Breaker — tracks daily AI spend in-memory and blocks calls when budget exceeded.
 * Resets daily. Protects against runaway AI costs.
 */

// Default: $5/day (500 cents). Override via env.
const DAILY_AI_BUDGET_CENTS = parseInt(process.env.DAILY_AI_BUDGET_CENTS || '500')

// Approximate cost per 1K tokens (Claude Sonnet 4)
const COST_PER_1K_INPUT = 0.3    // cents
const COST_PER_1K_OUTPUT = 1.5   // cents

let spentCents = 0
let currentDate = ''

function todayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function resetIfNewDay() {
  const today = todayDate()
  if (currentDate !== today) {
    currentDate = today
    spentCents = 0
  }
}

/**
 * Check if AI calls are allowed under the daily budget.
 */
export function checkAIBudget(): { allowed: boolean; spentCents: number; limitCents: number } {
  resetIfNewDay()
  return {
    allowed: spentCents < DAILY_AI_BUDGET_CENTS,
    spentCents,
    limitCents: DAILY_AI_BUDGET_CENTS,
  }
}

/**
 * Record token usage after an AI call completes.
 */
export function recordAISpend(inputTokens: number, outputTokens: number): void {
  resetIfNewDay()
  const costCents = Math.ceil(
    (inputTokens / 1000) * COST_PER_1K_INPUT +
    (outputTokens / 1000) * COST_PER_1K_OUTPUT
  )
  spentCents += costCents
}
