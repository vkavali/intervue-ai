import { CURATED_PROBLEMS } from '@/data/curated-75'
import { PROBLEM_BANK, type ProblemEntry } from '@/data/problem-bank'
import { prisma } from '@/lib/prisma'

// Pre-build lookup maps for O(1) access
const curatedMap = new Map<string, ProblemEntry>()
for (const p of CURATED_PROBLEMS) curatedMap.set(p.id, p)

const bankMap = new Map<string, ProblemEntry>()
for (const p of PROBLEM_BANK) bankMap.set(p.id, p)

function safeParseJSON(str: string | null, fallback: unknown) {
  if (!str) return fallback
  try { return JSON.parse(str) } catch { return fallback }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToProblemEntry(p: any): ProblemEntry {
  return {
    id: p.bankId || p.id,
    title: p.title,
    difficulty: p.difficulty as ProblemEntry['difficulty'],
    description: p.description,
    tags: safeParseJSON(p.tags, []),
    category: p.category || '',
    constraints: p.constraints || undefined,
    examples: p.examples || undefined,
    starterCode: safeParseJSON(p.starterCode, undefined),
    testCases: safeParseJSON(p.testCases, undefined),
    pattern: p.pattern || undefined,
    hints: safeParseJSON(p.hints, undefined),
    company: p.company || undefined,
  }
}

/**
 * Resolve a problem by ID across all banks.
 * Priority: curated > problem-bank > DB (generated bank)
 */
export async function resolveProblem(id: string): Promise<ProblemEntry | null> {
  const fromCurated = curatedMap.get(id)
  if (fromCurated) return fromCurated

  const fromBank = bankMap.get(id)
  if (fromBank) return fromBank

  // Look up in DB (generated bank problems)
  try {
    const dbProblem = await prisma.practiceProblem.findFirst({
      where: { bankId: id, userId: null },
    })
    if (dbProblem) return dbToProblemEntry(dbProblem)
  } catch {
    // DB unavailable, fall through
  }

  return null
}

/**
 * Get all problems from curated + static bank.
 * Generated bank problems are in DB and fetched via API on-demand.
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
