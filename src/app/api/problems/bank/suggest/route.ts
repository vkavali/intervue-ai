import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PROBLEM_BANK } from '@/data/problem-bank'

// Seniority → difficulty distribution
const SENIORITY_MIX: Record<string, Record<string, number>> = {
  JUNIOR: { EASY: 0.6, MEDIUM: 0.3, HARD: 0.1 },
  MID: { EASY: 0.3, MEDIUM: 0.5, HARD: 0.2 },
  SENIOR: { EASY: 0.1, MEDIUM: 0.4, HARD: 0.5 },
  STAFF: { EASY: 0.0, MEDIUM: 0.3, HARD: 0.7 },
  PRINCIPAL: { EASY: 0.0, MEDIUM: 0.2, HARD: 0.8 },
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// GET /api/problems/bank/suggest - Auto-suggest problems based on seniority/difficulty/tags
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user || (user.role !== 'COMPANY_ADMIN' && user.role !== 'INTERVIEWER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const count = Math.min(parseInt(searchParams.get('count') || '3'), 10)
    const seniority = searchParams.get('seniority') || 'MID'
    const difficulty = searchParams.get('difficulty') // override: EASY|MEDIUM|HARD
    const tags = searchParams.get('tags') // comma-separated
    const company = searchParams.get('company')

    let pool = [...PROBLEM_BANK]

    // Filter by company if specified
    if (company) {
      pool = pool.filter(
        (p) => p.company?.toLowerCase() === company.toLowerCase()
      )
    }

    // Filter by tags if specified
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim().toLowerCase())
      pool = pool.filter((p) =>
        tagList.some((tag) => p.tags.some((pt) => pt.toLowerCase() === tag))
      )
    }

    let selected: typeof pool = []

    if (difficulty) {
      // Fixed difficulty: just pick random from that difficulty
      const filtered = pool.filter((p) => p.difficulty === difficulty)
      selected = shuffle(filtered).slice(0, count)
    } else {
      // Use seniority-based difficulty mix
      const mix = SENIORITY_MIX[seniority] || SENIORITY_MIX.MID
      const easyCount = Math.round(count * mix.EASY)
      const hardCount = Math.round(count * mix.HARD)
      const mediumCount = count - easyCount - hardCount

      const easyPool = shuffle(pool.filter((p) => p.difficulty === 'EASY'))
      const mediumPool = shuffle(pool.filter((p) => p.difficulty === 'MEDIUM'))
      const hardPool = shuffle(pool.filter((p) => p.difficulty === 'HARD'))

      selected = [
        ...easyPool.slice(0, easyCount),
        ...mediumPool.slice(0, mediumCount),
        ...hardPool.slice(0, hardCount),
      ]

      // Ensure category diversity: try not to repeat categories
      const seen = new Set<string>()
      const diverse: typeof pool = []
      const rest: typeof pool = []

      for (const p of selected) {
        if (!seen.has(p.category)) {
          seen.add(p.category)
          diverse.push(p)
        } else {
          rest.push(p)
        }
      }

      // Fill remaining from rest
      selected = [...diverse, ...rest].slice(0, count)
    }

    // If not enough, fill with random from pool
    if (selected.length < count) {
      const selectedIds = new Set(selected.map((s) => s.id))
      const remaining = shuffle(
        pool.filter((p) => !selectedIds.has(p.id))
      ).slice(0, count - selected.length)
      selected = [...selected, ...remaining]
    }

    return NextResponse.json({
      problems: selected,
      count: selected.length,
    })
  } catch (error) {
    console.error('GET /api/problems/bank/suggest error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
