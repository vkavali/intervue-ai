import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkUserRateLimit } from '@/lib/rate-limiter'
import { resolveProblem } from '@/lib/problem-resolver'
import { generateEditorial } from '@/lib/ai-editorial'

// POST /api/practice/editorial — generate editorial for a problem
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
    const rateCheck = checkUserRateLimit(user.id, 'editorial', plan)
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

    // Gate: user must have COMPLETED/ABANDONED or spent 20+ min
    const progress = await prisma.practiceProgress.findFirst({
      where: {
        userId: user.id,
        bankProblemId,
      },
    })

    if (!progress) {
      return NextResponse.json(
        { error: 'You must attempt this problem before viewing the editorial' },
        { status: 403 }
      )
    }

    const hasAccess =
      progress.status === 'COMPLETED' ||
      progress.status === 'ABANDONED' ||
      progress.timeSpentSeconds >= 20 * 60

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Editorial unlocks after submitting a solution or spending 20+ minutes' },
        { status: 403 }
      )
    }

    // Check DB cache
    const cached = await prisma.problemEditorial.findUnique({
      where: { bankProblemId },
    })
    if (cached) {
      return NextResponse.json({
        editorial: {
          intuition: cached.intuition,
          bruteForce: cached.bruteForce,
          optimized: cached.optimized,
          complexity: cached.complexity,
          codeWalkthrough: cached.codeWalkthrough,
        },
        cached: true,
      })
    }

    // Resolve problem
    const problem = await resolveProblem(bankProblemId)
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    // Generate editorial via AI
    const editorial = await generateEditorial(problem)

    // Persist to DB
    await prisma.problemEditorial.create({
      data: {
        bankProblemId,
        intuition: editorial.intuition,
        bruteForce: editorial.bruteForce,
        optimized: editorial.optimized,
        complexity: editorial.complexity,
        codeWalkthrough: editorial.codeWalkthrough,
      },
    })

    return NextResponse.json({ editorial, cached: false })
  } catch (error) {
    console.error('POST /api/practice/editorial error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
