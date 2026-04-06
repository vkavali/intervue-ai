import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { buildWeaknessProfile } from '@/lib/weakness-profiler'
import { recommendProblems } from '@/lib/recommender'

// GET /api/practice/recommend?count=5&difficulty=MEDIUM
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const count = Math.min(parseInt(searchParams.get('count') || '5', 10), 20)
    const difficulty = searchParams.get('difficulty') || undefined

    // Get or build weakness profile
    let profile
    const cached = await prisma.weaknessProfile.findUnique({
      where: { userId: user.id },
    })

    if (cached && Date.now() - new Date(cached.updatedAt).getTime() < 60 * 60 * 1000) {
      profile = JSON.parse(cached.profile)
    } else {
      const progress = await prisma.practiceProgress.findMany({
        where: { userId: user.id },
        select: { bankProblemId: true, status: true, timeSpentSeconds: true },
      })
      profile = await buildWeaknessProfile(progress)
    }

    // Get completed problem IDs
    const completedRecords = await prisma.practiceProgress.findMany({
      where: { userId: user.id, status: 'COMPLETED' },
      select: { bankProblemId: true },
    })
    const completedIds = new Set(
      completedRecords.map((r) => r.bankProblemId).filter(Boolean) as string[]
    )

    const recommendations = recommendProblems(profile, completedIds, count, difficulty)

    return NextResponse.json({
      recommendations: recommendations.map((r) => ({
        id: r.problem.id,
        title: r.problem.title,
        difficulty: r.problem.difficulty,
        category: r.problem.category,
        pattern: r.problem.pattern,
        tags: r.problem.tags,
        score: r.score,
        reasons: r.reasons,
      })),
    })
  } catch (error) {
    console.error('GET /api/practice/recommend error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
