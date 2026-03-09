import { getAllProblems } from './problem-resolver'
import type { ProblemEntry } from '@/data/problem-bank'

/**
 * Tokenize a string into lowercase word tokens.
 */
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2) // skip very short words
  )
}

/**
 * Compute Jaccard similarity between two sets of tokens.
 * Returns a value between 0 (no overlap) and 1 (identical).
 */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  let intersection = 0
  Array.from(a).forEach((token) => {
    if (b.has(token)) intersection++
  })
  const union = a.size + b.size - intersection
  return union === 0 ? 0 : intersection / union
}

export interface DuplicateResult {
  problem: ProblemEntry
  similarity: number
}

/**
 * Find potential duplicates of a given problem in the existing banks.
 * Uses Jaccard similarity on title + description tokens.
 */
export function findDuplicates(
  problem: { title: string; description: string },
  threshold = 0.6
): DuplicateResult[] {
  const inputTokens = tokenize(`${problem.title} ${problem.description}`)
  const allProblems = getAllProblems()
  const results: DuplicateResult[] = []

  for (const existing of allProblems) {
    const existingTokens = tokenize(`${existing.title} ${existing.description}`)
    const similarity = jaccardSimilarity(inputTokens, existingTokens)

    if (similarity >= threshold) {
      results.push({ problem: existing, similarity })
    }
  }

  results.sort((a, b) => b.similarity - a.similarity)
  return results
}
