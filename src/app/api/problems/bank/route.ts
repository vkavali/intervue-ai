import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PROBLEM_BANK } from '@/data/problem-bank'

// GET /api/problems/bank - Search and filter the problem bank
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
    const search = searchParams.get('search')?.toLowerCase()
    const difficulty = searchParams.get('difficulty')
    const category = searchParams.get('category')
    const company = searchParams.get('company')
    const tags = searchParams.get('tags') // comma-separated
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    let results = [...PROBLEM_BANK]

    // Apply filters
    if (search) {
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.tags.some((t) => t.toLowerCase().includes(search))
      )
    }

    if (difficulty) {
      results = results.filter((p) => p.difficulty === difficulty)
    }

    if (category) {
      results = results.filter((p) => p.category === category)
    }

    if (company) {
      results = results.filter(
        (p) => p.company?.toLowerCase() === company.toLowerCase()
      )
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim().toLowerCase())
      results = results.filter((p) =>
        tagList.some((tag) => p.tags.some((pt) => pt.toLowerCase() === tag))
      )
    }

    // Check which have enrichment data
    const enrichedIds = await prisma.enrichedBankProblem.findMany({
      select: { bankProblemId: true },
    })
    const enrichedSet = new Set(enrichedIds.map((e) => e.bankProblemId))

    const total = results.length
    const offset = (page - 1) * limit
    const paged = results.slice(offset, offset + limit)

    // Collect unique categories and companies for filter options
    const categories = Array.from(new Set(PROBLEM_BANK.map((p) => p.category))).sort()
    const companies = Array.from(
      new Set(PROBLEM_BANK.map((p) => p.company).filter((c): c is string => !!c))
    ).sort()

    return NextResponse.json({
      problems: paged.map((p) => ({
        ...p,
        enriched: enrichedSet.has(p.id),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters: { categories, companies },
    })
  } catch (error) {
    console.error('GET /api/problems/bank error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
