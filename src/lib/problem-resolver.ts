import { CURATED_PROBLEMS } from '@/data/curated-75'
import { PROBLEM_BANK, type ProblemEntry } from '@/data/problem-bank'
import { GENERATED_PROBLEMS } from '@/data/generated-bank'

// Pre-build lookup maps for O(1) access
const curatedMap = new Map<string, ProblemEntry>()
for (const p of CURATED_PROBLEMS) curatedMap.set(p.id, p)

const bankMap = new Map<string, ProblemEntry>()
for (const p of PROBLEM_BANK) bankMap.set(p.id, p)

const generatedMap = new Map<string, ProblemEntry>()
for (const p of GENERATED_PROBLEMS) generatedMap.set(p.id, p)

/**
 * Resolve a problem by ID across all 3 banks.
 * Priority: curated > problem-bank > generated-bank
 */
export function resolveProblem(id: string): ProblemEntry | null {
  return curatedMap.get(id) || bankMap.get(id) || generatedMap.get(id) || null
}

/**
 * Get all problems from all banks, deduplicated by ID.
 * Curated versions take priority over bank versions.
 */
export function getAllProblems(): ProblemEntry[] {
  const seen = new Set<string>()
  const result: ProblemEntry[] = []

  for (const p of CURATED_PROBLEMS) {
    if (!seen.has(p.id)) { seen.add(p.id); result.push(p) }
  }
  for (const p of PROBLEM_BANK) {
    if (!seen.has(p.id)) { seen.add(p.id); result.push(p) }
  }
  for (const p of GENERATED_PROBLEMS) {
    if (!seen.has(p.id)) { seen.add(p.id); result.push(p) }
  }

  return result
}

/**
 * Get problems filtered by pattern/category.
 */
export function getProblemsByPattern(pattern: string): ProblemEntry[] {
  return getAllProblems().filter(
    (p) => p.pattern === pattern || p.category === pattern
  )
}
