import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkUserRateLimit } from '@/lib/rate-limiter'
import { buildWeaknessProfile } from '@/lib/weakness-profiler'

// GET /api/practice/weakness-profile — return cached or rebuilt profile
export async function GET() {
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

    // Check for cached profile (< 1 hour old)
    const cached = await prisma.weaknessProfile.findUnique({
      where: { userId: user.id },
    })

    if (cached) {
      const age = Date.now() - new Date(cached.updatedAt).getTime()
      if (age < 60 * 60 * 1000) {
        return NextResponse.json({
          profile: JSON.parse(cached.profile),
          cached: true,
        })
      }
    }

    // Rebuild profile from progress records
    const progress = await prisma.practiceProgress.findMany({
      where: { userId: user.id },
      select: { bankProblemId: true, status: true, timeSpentSeconds: true },
    })

    const profile = await buildWeaknessProfile(progress)

    // Upsert cache
    await prisma.weaknessProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, profile: JSON.stringify(profile) },
      update: { profile: JSON.stringify(profile) },
    })

    return NextResponse.json({ profile, cached: false })
  } catch (error) {
    console.error('GET /api/practice/weakness-profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/practice/weakness-profile — force refresh
export async function POST(_req: NextRequest) {
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

    const progress = await prisma.practiceProgress.findMany({
      where: { userId: user.id },
      select: { bankProblemId: true, status: true, timeSpentSeconds: true },
    })

    const profile = await buildWeaknessProfile(progress)

    await prisma.weaknessProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, profile: JSON.stringify(profile) },
      update: { profile: JSON.stringify(profile) },
    })

    return NextResponse.json({ profile, cached: false })
  } catch (error) {
    console.error('POST /api/practice/weakness-profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
