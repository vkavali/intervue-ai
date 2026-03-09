import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkUserRateLimit } from '@/lib/rate-limiter'
import { resolveProblem } from '@/lib/problem-resolver'
import { scoreQuality } from '@/lib/quality-scorer'

// POST /api/practice/quality-score — score a single problem's quality
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const plan = user.company?.plan || null
    const rateCheck = checkUserRateLimit(user.id, 'qualityScore', plan)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', resetIn: rateCheck.resetIn },
        { status: 429 }
      )
    }

    const { bankProblemId } = await req.json()
    if (!bankProblemId) {
      return NextResponse.json({ error: 'bankProblemId is required' }, { status: 400 })
    }

    // Check DB cache
    const cached = await prisma.problemQualityScore.findUnique({
      where: { bankProblemId },
    })
    if (cached) {
      return NextResponse.json({
        qualityScore: {
          overallScore: cached.overallScore,
          clarity: cached.clarity,
          usefulness: cached.usefulness,
          ambiguity: cached.ambiguity,
          exampleQuality: cached.exampleQuality,
          difficultyAccuracy: cached.difficultyAccuracy,
        },
        cached: true,
      })
    }

    const problem = resolveProblem(bankProblemId)
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    const qualityScore = await scoreQuality(problem)

    // Persist to DB
    await prisma.problemQualityScore.create({
      data: {
        bankProblemId,
        overallScore: qualityScore.overallScore,
        clarity: qualityScore.clarity,
        usefulness: qualityScore.usefulness,
        ambiguity: qualityScore.ambiguity,
        exampleQuality: qualityScore.exampleQuality,
        difficultyAccuracy: qualityScore.difficultyAccuracy,
      },
    })

    return NextResponse.json({ qualityScore, cached: false })
  } catch (error) {
    console.error('POST /api/practice/quality-score error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
