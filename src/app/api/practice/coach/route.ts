import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkUserRateLimit } from '@/lib/rate-limiter'
import { resolveProblem } from '@/lib/problem-resolver'
import { generateCoachingFeedback } from '@/lib/ai-coach'

// POST /api/practice/coach — get AI coaching on submitted code
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
    const rateCheck = checkUserRateLimit(user.id, 'coaching', plan)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', resetIn: rateCheck.resetIn },
        { status: 429 }
      )
    }

    const { bankProblemId, code, language, timeSpentSeconds, testsPassed, testsTotal } =
      await req.json()

    if (!bankProblemId || !code || !language) {
      return NextResponse.json(
        { error: 'bankProblemId, code, and language are required' },
        { status: 400 }
      )
    }

    const problem = await resolveProblem(bankProblemId)
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    const feedback = await generateCoachingFeedback({
      problem,
      code,
      language,
      timeSpentSeconds: timeSpentSeconds || 0,
      testsPassed: testsPassed || 0,
      testsTotal: testsTotal || 0,
    })

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('POST /api/practice/coach error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
