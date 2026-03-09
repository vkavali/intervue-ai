import { callClaudeJSON } from './ai-client'
import type { ProblemEntry } from '@/data/problem-bank'

export interface StructuredHints {
  pattern: string
  dataStructure: string
  approach: string
}

const SYSTEM_PROMPT = `You are a coding interview coach. Generate exactly 3 progressive hints for solving the given problem. Each hint should be progressively more specific:

1. Pattern hint: A vague nudge about the algorithmic pattern or thinking approach. Do NOT name the exact data structure.
2. Data structure hint: Name the specific data structure and how it helps, but don't give the full approach.
3. Approach hint: A step-by-step outline of the solution approach (numbered steps), without actual code.

Respond with ONLY a JSON object (no markdown fences):
{
  "pattern": "Think about what gives O(1) lookups...",
  "dataStructure": "Consider using a hash map where keys are...",
  "approach": "1. Iterate once through the array. 2. For each element..."
}`

/**
 * Generate structured progressive hints for a problem.
 */
export async function generateStructuredHints(
  problem: ProblemEntry
): Promise<StructuredHints> {
  const prompt = `## Problem
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Category: ${problem.category}
Tags: ${problem.tags.join(', ')}
Description: ${problem.description}
${problem.constraints ? `Constraints: ${problem.constraints}` : ''}`

  return callClaudeJSON<StructuredHints>(SYSTEM_PROMPT, prompt, 1024)
}
