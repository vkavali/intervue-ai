import { callClaudeJSON } from './ai-client'
import type { ProblemEntry } from '@/data/problem-bank'

export interface QualityScoreData {
  overallScore: number    // 0-100
  clarity: number         // 0-100
  usefulness: number      // 0-100
  ambiguity: number       // 0-100 (lower = more ambiguous = bad)
  exampleQuality: number  // 0-100
  difficultyAccuracy: number // 0-100
}

const SYSTEM_PROMPT = `You are a coding problem quality evaluator. Score the given problem on these dimensions (each 0-100):

1. Clarity: Is the problem statement clear and unambiguous?
2. Usefulness: Is this a valuable problem for interview preparation?
3. Ambiguity: Is the problem free of ambiguity? (100 = perfectly clear, 0 = very ambiguous)
4. Example Quality: Are the examples helpful and sufficient?
5. Difficulty Accuracy: Does the stated difficulty match the actual difficulty?
6. Overall Score: A weighted average considering all factors.

Respond with ONLY a JSON object (no markdown fences):
{
  "overallScore": 82,
  "clarity": 85,
  "usefulness": 90,
  "ambiguity": 75,
  "exampleQuality": 80,
  "difficultyAccuracy": 85
}`

/**
 * AI-evaluate quality of a practice problem.
 */
export async function scoreQuality(
  problem: ProblemEntry
): Promise<QualityScoreData> {
  const prompt = `## Problem to Evaluate
Title: ${problem.title}
Stated Difficulty: ${problem.difficulty}
Category: ${problem.category}
Tags: ${problem.tags.join(', ')}
Description: ${problem.description}
${problem.constraints ? `Constraints: ${problem.constraints}` : 'Constraints: (none provided)'}
${problem.examples ? `Examples: ${problem.examples}` : 'Examples: (none provided)'}

Evaluate this problem's quality.`

  return callClaudeJSON<QualityScoreData>(SYSTEM_PROMPT, prompt, 1024)
}
