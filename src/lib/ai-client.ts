import Anthropic from '@anthropic-ai/sdk'
import { checkAIBudget, recordAISpend } from './ai-circuit-breaker'

let client: Anthropic | null = null

export function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return client
}

// Max input sizes to prevent token inflation attacks
const MAX_SYSTEM_LENGTH = 5000
const MAX_PROMPT_LENGTH = 10000

function validateInputLength(system: string, prompt: string) {
  if (system.length > MAX_SYSTEM_LENGTH) {
    throw new Error('System prompt too long')
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new Error('Prompt too long')
  }
}

/**
 * Call Claude and parse the response as JSON.
 * Strips markdown fences if present.
 * Enforces daily AI budget via circuit breaker.
 */
export async function callClaudeJSON<T>(
  system: string,
  prompt: string,
  maxTokens = 4096
): Promise<T> {
  const anthropic = getAnthropicClient()
  if (!anthropic) throw new Error('AI service not configured')

  validateInputLength(system, prompt)

  const budget = checkAIBudget()
  if (!budget.allowed) {
    throw new Error('AI service temporarily unavailable due to high demand. Please try again later.')
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  })

  // Record token spend
  if (response.usage) {
    recordAISpend(response.usage.input_tokens, response.usage.output_tokens)
  }

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI')
  }

  let jsonText = textBlock.text.trim()
  // Strip markdown code fences
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  return JSON.parse(jsonText) as T
}

/**
 * Call Claude and return the raw text response.
 * Enforces daily AI budget via circuit breaker.
 */
export async function callClaudeText(
  system: string,
  prompt: string,
  maxTokens = 2048
): Promise<string> {
  const anthropic = getAnthropicClient()
  if (!anthropic) throw new Error('AI service not configured')

  validateInputLength(system, prompt)

  const budget = checkAIBudget()
  if (!budget.allowed) {
    throw new Error('AI service temporarily unavailable due to high demand. Please try again later.')
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  })

  // Record token spend
  if (response.usage) {
    recordAISpend(response.usage.input_tokens, response.usage.output_tokens)
  }

  const textBlock = response.content.find((block) => block.type === 'text')
  return textBlock && textBlock.type === 'text' ? textBlock.text : ''
}
