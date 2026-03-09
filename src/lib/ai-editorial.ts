import { callClaudeJSON } from './ai-client'
import type { ProblemEntry } from '@/data/problem-bank'

export interface EditorialData {
  intuition: string
  bruteForce: string
  optimized: string
  complexity: string
  codeWalkthrough: string
}

const SYSTEM_PROMPT = `You are a coding interview editorial writer. Generate a comprehensive editorial for the given problem with 5 sections:

1. Intuition: The key insight that unlocks the solution. Explain *why* the approach works.
2. Brute Force: Describe the naive solution, its time/space complexity, and why it's suboptimal.
3. Optimized: Describe the optimal solution step-by-step in plain English (no code).
4. Complexity: Time and space complexity analysis for the optimal solution with justification.
5. Code Walkthrough: A line-by-line explanation of how you'd implement the optimal solution (in pseudocode-like English, not actual code).

Respond with ONLY a JSON object (no markdown fences):
{
  "intuition": "...",
  "bruteForce": "...",
  "optimized": "...",
  "complexity": "...",
  "codeWalkthrough": "..."
}`

/**
 * Generate a comprehensive editorial for a problem.
 */
export async function generateEditorial(
  problem: ProblemEntry
): Promise<EditorialData> {
  const prompt = `## Problem
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Category: ${problem.category}
Tags: ${problem.tags.join(', ')}
Description: ${problem.description}
${problem.constraints ? `Constraints: ${problem.constraints}` : ''}
${problem.examples ? `Examples: ${problem.examples}` : ''}`

  return callClaudeJSON<EditorialData>(SYSTEM_PROMPT, prompt, 4096)
}
