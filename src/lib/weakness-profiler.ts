import { resolveProblem } from './problem-resolver'

export interface PatternStats {
  pattern: string
  attempted: number
  completed: number
  abandoned: number
  avgTimeSeconds: number
  completionRate: number
  score: number // 0-100, higher = stronger
}

export interface WeaknessProfileData {
  weakPatterns: PatternStats[]
  strongPatterns: PatternStats[]
  overallStats: {
    totalAttempted: number
    totalCompleted: number
    totalAbandoned: number
    avgTimeSeconds: number
    overallCompletionRate: number
  }
  generatedAt: string
}

interface ProgressRecord {
  bankProblemId: string | null
  status: string
  timeSpentSeconds: number
}

/**
 * Build a weakness profile from practice progress records.
 */
export function buildWeaknessProfile(
  progressRecords: ProgressRecord[]
): WeaknessProfileData {
  // Group progress by pattern/category
  const patternMap = new Map<string, {
    attempted: number
    completed: number
    abandoned: number
    totalTime: number
  }>()

  let totalAttempted = 0
  let totalCompleted = 0
  let totalAbandoned = 0
  let totalTime = 0

  for (const record of progressRecords) {
    if (!record.bankProblemId) continue

    const problem = resolveProblem(record.bankProblemId)
    const pattern = problem?.pattern || problem?.category || 'Unknown'

    if (!patternMap.has(pattern)) {
      patternMap.set(pattern, { attempted: 0, completed: 0, abandoned: 0, totalTime: 0 })
    }

    const stats = patternMap.get(pattern)!
    stats.attempted++
    totalAttempted++
    totalTime += record.timeSpentSeconds

    if (record.status === 'COMPLETED') {
      stats.completed++
      totalCompleted++
    } else if (record.status === 'ABANDONED') {
      stats.abandoned++
      totalAbandoned++
    }

    stats.totalTime += record.timeSpentSeconds
  }

  // Calculate per-pattern scores
  const patternStats: PatternStats[] = []

  for (const [pattern, data] of Array.from(patternMap)) {
    const completionRate = data.attempted > 0 ? data.completed / data.attempted : 0
    const avgTime = data.attempted > 0 ? data.totalTime / data.attempted : 0

    // Weighted score: completion rate (60%) + abandon penalty (20%) + time bonus (20%)
    const completionScore = completionRate * 60
    const abandonPenalty = data.attempted > 0 ? (data.abandoned / data.attempted) * 20 : 0
    // Time bonus: faster is better (cap at 30 min avg)
    const timeScore = Math.max(0, 20 - (avgTime / 1800) * 20)
    const score = Math.round(Math.max(0, Math.min(100, completionScore - abandonPenalty + timeScore)))

    patternStats.push({
      pattern,
      attempted: data.attempted,
      completed: data.completed,
      abandoned: data.abandoned,
      avgTimeSeconds: Math.round(avgTime),
      completionRate: Math.round(completionRate * 100) / 100,
      score,
    })
  }

  // Sort: lowest score = weakest
  patternStats.sort((a, b) => a.score - b.score)

  const weakThreshold = 50
  const strongThreshold = 60

  return {
    weakPatterns: patternStats.filter((p) => p.score < weakThreshold),
    strongPatterns: patternStats.filter((p) => p.score >= strongThreshold),
    overallStats: {
      totalAttempted,
      totalCompleted,
      totalAbandoned,
      avgTimeSeconds: totalAttempted > 0 ? Math.round(totalTime / totalAttempted) : 0,
      overallCompletionRate:
        totalAttempted > 0 ? Math.round((totalCompleted / totalAttempted) * 100) / 100 : 0,
    },
    generatedAt: new Date().toISOString(),
  }
}
