import { callClaudeJSON } from './ai-client'
import type { ProblemEntry } from '@/data/problem-bank'

export interface CoachingFeedback {
  overallAssessment: string
  score: number // 0-100
  whatWentWell: string[]
  whatToImprove: string[]
  complexityAnalysis: {
    yourTime: string
    yourSpace: string
    optimalTime: string
    optimalSpace: string
  }
  patternRecognition: string
  followUpQuestions: string[]
}

const SYSTEM_PROMPT = `You are a senior coding interview coach reviewing a candidate's submitted solution. Analyze their code and provide constructive, actionable feedback.

Respond with ONLY a JSON object (no markdown fences):
{
  "overallAssessment": "A 2-3 sentence summary of their performance",
  "score": 75,
  "whatWentWell": ["Correctly identified the pattern", "Clean variable naming"],
  "whatToImprove": ["Could optimize the inner loop", "Missing edge case for empty input"],
  "complexityAnalysis": {
    "yourTime": "O(n^2)",
    "yourSpace": "O(1)",
    "optimalTime": "O(n)",
    "optimalSpace": "O(n)"
  },
  "patternRecognition": "This is a classic sliding window problem...",
  "followUpQuestions": [
    "How would you handle this if the input was a stream?",
    "Can you solve this in-place with O(1) extra space?"
  ]
}`

/**
 * Generate coaching feedback for a submitted solution.
 * NOT cached — unique to each submission's code.
 */
export async function generateCoachingFeedback(params: {
  problem: ProblemEntry
  code: string
  language: string
  timeSpentSeconds: number
  testsPassed: number
  testsTotal: number
}): Promise<CoachingFeedback> {
  const { problem, code, language, timeSpentSeconds, testsPassed, testsTotal } = params
  const minutes = Math.round(timeSpentSeconds / 60)

  const prompt = `## Problem
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Category: ${problem.category}
Tags: ${problem.tags.join(', ')}
Description: ${problem.description}
${problem.constraints ? `Constraints: ${problem.constraints}` : ''}

## Candidate's Solution (${language})
\`\`\`${language}
${code}
\`\`\`

## Performance
- Time spent: ${minutes} minutes
- Tests passed: ${testsPassed}/${testsTotal}

Provide detailed coaching feedback.`

  return callClaudeJSON<CoachingFeedback>(SYSTEM_PROMPT, prompt, 2048)
}
