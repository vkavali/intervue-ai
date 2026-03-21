import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getValidStageValues } from '@/data/pipeline-stages'

// GET /api/pipeline - List all candidates in the pipeline for the company
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

    if (user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json(
        { error: 'Only company admins can access the pipeline' },
        { status: 403 }
      )
    }

    if (!user.companyId) {
      return NextResponse.json(
        { error: 'User not associated with a company' },
        { status: 403 }
      )
    }

    // Optional role filter
    const { searchParams } = new URL(req.url)
    const roleFilter = searchParams.get('role')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { companyId: user.companyId }
    if (roleFilter) {
      where.role = roleFilter
    }

    const pipelineEntries = await prisma.candidatePipeline.findMany({
      where,
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            candidateSessions: {
              where: { companyId: user.companyId },
              include: {
                template: { select: { title: true, role: true, roundType: true } },
                auditReport: {
                  select: {
                    overallScore: true,
                    suggestedDecision: true,
                    problemComprehension: true,
                    solutionCorrectness: true,
                    codeQuality: true,
                    communication: true,
                    aiUsageQuality: true,
                    timeManagement: true,
                    confidence: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    })

    // Group entries by role
    const groupedByRole: Record<string, typeof pipelineEntries> = {}
    for (const entry of pipelineEntries) {
      if (!groupedByRole[entry.role]) {
        groupedByRole[entry.role] = []
      }
      groupedByRole[entry.role].push(entry)
    }

    return NextResponse.json({
      total: pipelineEntries.length,
      byRole: groupedByRole,
      entries: pipelineEntries,
    })
  } catch (error) {
    console.error('GET /api/pipeline error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/pipeline - Add a candidate to the pipeline
export async function POST(req: NextRequest) {
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

    if (user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json(
        { error: 'Only company admins can manage the pipeline' },
        { status: 403 }
      )
    }

    if (!user.companyId) {
      return NextResponse.json(
        { error: 'User not associated with a company' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { candidateId, candidateEmail: rawCandidateEmail, candidateName, role, seniority, stage } = body
    const candidateEmail = rawCandidateEmail?.toLowerCase().trim()

    if (!role || !seniority) {
      return NextResponse.json(
        { error: 'Missing required fields: role, seniority' },
        { status: 400 }
      )
    }

    if (!candidateId && !candidateEmail) {
      return NextResponse.json(
        { error: 'Either candidateId or candidateEmail is required' },
        { status: 400 }
      )
    }

    // Validate stage if provided — stages are now department-aware
    const validStages = getValidStageValues(body.department || null)
    if (stage && !validStages.includes(stage)) {
      return NextResponse.json(
        { error: `Invalid stage. Must be one of: ${validStages.join(', ')}` },
        { status: 400 }
      )
    }

    let resolvedCandidateId = candidateId

    if (candidateId) {
      // Verify the candidate exists by ID
      const candidate = await prisma.user.findUnique({
        where: { id: candidateId },
      })

      if (!candidate) {
        return NextResponse.json(
          { error: 'Candidate not found' },
          { status: 404 }
        )
      }

      if (candidate.role !== 'CANDIDATE') {
        return NextResponse.json(
          { error: 'Specified user is not a candidate' },
          { status: 400 }
        )
      }
    } else if (candidateEmail) {
      // Find or create candidate by email
      let candidate = await prisma.user.findUnique({
        where: { email: candidateEmail },
      })

      if (!candidate) {
        if (!candidateName) {
          return NextResponse.json(
            { error: 'candidateName is required when creating a new candidate' },
            { status: 400 }
          )
        }
        candidate = await prisma.user.create({
          data: {
            email: candidateEmail,
            name: candidateName,
            password: '',
            role: 'CANDIDATE',
          },
        })
      }

      resolvedCandidateId = candidate.id
    }

    // Check for existing pipeline entry (unique constraint: companyId + candidateId + role)
    const existing = await prisma.candidatePipeline.findUnique({
      where: {
        companyId_candidateId_role: {
          companyId: user.companyId,
          candidateId: resolvedCandidateId,
          role,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Candidate is already in the pipeline for this role' },
        { status: 409 }
      )
    }

    const pipelineEntry = await prisma.candidatePipeline.create({
      data: {
        companyId: user.companyId,
        candidateId: resolvedCandidateId,
        role,
        seniority,
        stage: stage || 'SCREENING',
      },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(pipelineEntry, { status: 201 })
  } catch (error) {
    console.error('POST /api/pipeline error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
