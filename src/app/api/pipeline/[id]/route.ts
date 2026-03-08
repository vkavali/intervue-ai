import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const VALID_STAGES = [
  'SCREENING',
  'TECHNICAL',
  'SYSTEM_DESIGN',
  'BEHAVIORAL',
  'FINAL',
  'HIRED',
  'REJECTED',
  'ON_HOLD',
]

// PATCH /api/pipeline/[id] - Update pipeline entry (change stage, add notes)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const pipelineEntry = await prisma.candidatePipeline.findUnique({
      where: { id: params.id },
    })

    if (!pipelineEntry) {
      return NextResponse.json(
        { error: 'Pipeline entry not found' },
        { status: 404 }
      )
    }

    // Verify the entry belongs to the user's company
    if (pipelineEntry.companyId !== user.companyId) {
      return NextResponse.json(
        { error: 'Pipeline entry does not belong to your company' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { stage, notes } = body

    const updateData: Record<string, unknown> = {}

    if (stage !== undefined) {
      if (!VALID_STAGES.includes(stage)) {
        return NextResponse.json(
          { error: `Invalid stage. Must be one of: ${VALID_STAGES.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.stage = stage
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid update fields provided. Accepted fields: stage, notes' },
        { status: 400 }
      )
    }

    const updated = await prisma.candidatePipeline.update({
      where: { id: params.id },
      data: updateData,
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/pipeline/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/pipeline/[id] - Remove from pipeline
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const pipelineEntry = await prisma.candidatePipeline.findUnique({
      where: { id: params.id },
    })

    if (!pipelineEntry) {
      return NextResponse.json(
        { error: 'Pipeline entry not found' },
        { status: 404 }
      )
    }

    // Verify the entry belongs to the user's company
    if (pipelineEntry.companyId !== user.companyId) {
      return NextResponse.json(
        { error: 'Pipeline entry does not belong to your company' },
        { status: 403 }
      )
    }

    await prisma.candidatePipeline.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Pipeline entry removed successfully' })
  } catch (error) {
    console.error('DELETE /api/pipeline/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
