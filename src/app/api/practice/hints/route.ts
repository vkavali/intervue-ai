import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkUserRateLimit } from '@/lib/rate-limiter'
import { resolveProblem } from '@/lib/problem-resolver'
import { generateStructuredHints } from '@/lib/ai-hints'

// POST /api/practice/hints — generate structured hints for a problem
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
    const rateCheck = checkUserRateLimit(user.id, 'practiceAi', plan)
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

    // Check DB cache first
    const cached = await prisma.problemHints.findUnique({
      where: { bankProblemId },
    })
    if (cached) {
      return NextResponse.json({
        hints: JSON.parse(cached.hints),
        cached: true,
      })
    }

    // Resolve problem across all banks
    const problem = resolveProblem(bankProblemId)
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    // If problem already has static hints, return them directly (no AI call)
    if (problem.hints && problem.hints.length >= 3) {
      const staticHints = {
        pattern: problem.hints[0],
        dataStructure: problem.hints[1],
        approach: problem.hints[2],
      }
      return NextResponse.json({ hints: staticHints, cached: true, static: true })
    }

    // Generate hints via AI
    const hints = await generateStructuredHints(problem)

    // Persist to DB
    await prisma.problemHints.create({
      data: {
        bankProblemId,
        hints: JSON.stringify(hints),
      },
    })

    return NextResponse.json({ hints, cached: false })
  } catch (error) {
    console.error('POST /api/practice/hints error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
