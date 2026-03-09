import { getAllProblems } from './problem-resolver'
import type { ProblemEntry } from '@/data/problem-bank'
import type { WeaknessProfileData } from './weakness-profiler'

export interface Recommendation {
  problem: ProblemEntry
  score: number
  reasons: string[]
}

/**
 * Recommend problems based on weakness profile.
 * Pure function — no AI call needed.
 */
export function recommendProblems(
  profile: WeaknessProfileData,
  completedIds: Set<string>,
  count = 5,
  difficultyFilter?: string
): Recommendation[] {
  const allProblems = getAllProblems()
  const weakPatternSet = new Set(profile.weakPatterns.map((p) => p.pattern))
  const weakPatternScores = new Map(profile.weakPatterns.map((p) => [p.pattern, p.score]))

  const scored: Recommendation[] = []

  for (const problem of allProblems) {
    // Skip completed problems (anti-memorization)
    if (completedIds.has(problem.id)) continue

    // Apply difficulty filter
    if (difficultyFilter && problem.difficulty !== difficultyFilter) continue

    const pattern = problem.pattern || problem.category
    let score = 0
    const reasons: string[] = []

    // Weak pattern bonus: weaker patterns get higher priority
    if (weakPatternSet.has(pattern)) {
      const patternScore = weakPatternScores.get(pattern) || 50
      const bonus = Math.round(10 + (50 - patternScore) / 5) // 10-20 bonus
      score += bonus
      reasons.push(`Weak area: ${pattern} (score: ${patternScore}/100)`)
    }

    // Low completion rate category bonus
    const patternStats = [...profile.weakPatterns, ...profile.strongPatterns].find(
      (p) => p.pattern === pattern
    )
    if (patternStats && patternStats.completionRate < 0.5) {
      score += 5
      reasons.push(`Low completion rate: ${Math.round(patternStats.completionRate * 100)}%`)
    }

    // Difficulty progression bonus
    if (profile.overallStats.overallCompletionRate > 0.7) {
      // User is strong — nudge toward harder problems
      if (problem.difficulty === 'HARD') { score += 3; reasons.push('Ready for harder challenges') }
      else if (problem.difficulty === 'MEDIUM') score += 1
    } else if (profile.overallStats.overallCompletionRate < 0.4) {
      // User is struggling — suggest easier problems
      if (problem.difficulty === 'EASY') { score += 3; reasons.push('Build confidence with easier problems') }
      else if (problem.difficulty === 'MEDIUM') score += 1
    } else {
      // Balanced — medium difficulty
      if (problem.difficulty === 'MEDIUM') { score += 2; reasons.push('Good difficulty match') }
    }

    // Untried pattern bonus
    if (!patternStats) {
      score += 4
      reasons.push(`New pattern to explore: ${pattern}`)
    }

    if (score > 0 || reasons.length === 0) {
      if (reasons.length === 0) reasons.push('General practice')
      scored.push({ problem, score, reasons })
    }
  }

  // Sort by score descending, take top N
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, count)
}
