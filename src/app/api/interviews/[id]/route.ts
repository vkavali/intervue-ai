import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/interviews/[id] - Get a single interview template with questions
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user || !user.companyId) {
      return NextResponse.json(
        { error: "User not associated with a company" },
        { status: 403 }
      )
    }

    const template = await prisma.interviewTemplate.findUnique({
      where: { id: params.id },
      include: { questions: { orderBy: { orderIndex: "asc" } } },
    })

    if (!template) {
      return NextResponse.json(
        { error: "Interview template not found" },
        { status: 404 }
      )
    }

    if (template.companyId !== user.companyId) {
      return NextResponse.json(
        { error: "Access denied to this template" },
        { status: 403 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("GET /api/interviews/[id] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/interviews/[id] - Update an interview template
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user || !user.companyId) {
      return NextResponse.json(
        { error: "User not associated with a company" },
        { status: 403 }
      )
    }

    if (user.role !== "COMPANY_ADMIN") {
      return NextResponse.json(
        { error: "Only company admins can update interview templates" },
        { status: 403 }
      )
    }

    const existing = await prisma.interviewTemplate.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Interview template not found" },
        { status: 404 }
      )
    }

    if (existing.companyId !== user.companyId) {
      return NextResponse.json(
        { error: "Access denied to this template" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { title, role, seniority, roundType, defaultAiLevel, questions } = body

    const updated = await prisma.$transaction(async (tx) => {
      // Update the template fields
      const template = await tx.interviewTemplate.update({
        where: { id: params.id },
        data: {
          ...(title !== undefined && { title }),
          ...(role !== undefined && { role }),
          ...(seniority !== undefined && { seniority }),
          ...(roundType !== undefined && { roundType }),
          ...(defaultAiLevel !== undefined && { defaultAiLevel }),
        },
      })

      // If questions are provided, replace them
      if (questions && Array.isArray(questions)) {
        await tx.question.deleteMany({
          where: { templateId: params.id },
        })

        await tx.question.createMany({
          data: questions.map(
            (
              q: {
                title: string
                description: string
                constraints?: string
                examples?: string
                difficulty: string
                aiLevel?: number
                timeLimit: number
              },
              index: number
            ) => ({
              templateId: params.id,
              title: q.title,
              description: q.description,
              constraints: q.constraints ?? null,
              examples: q.examples ?? null,
              difficulty: q.difficulty,
              aiLevel: q.aiLevel ?? defaultAiLevel ?? template.defaultAiLevel,
              timeLimit: q.timeLimit,
              orderIndex: index,
            })
          ),
        })
      }

      return tx.interviewTemplate.findUnique({
        where: { id: params.id },
        include: { questions: { orderBy: { orderIndex: "asc" } } },
      })
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT /api/interviews/[id] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/interviews/[id] - Delete an interview template
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user || !user.companyId) {
      return NextResponse.json(
        { error: "User not associated with a company" },
        { status: 403 }
      )
    }

    if (user.role !== "COMPANY_ADMIN") {
      return NextResponse.json(
        { error: "Only company admins can delete interview templates" },
        { status: 403 }
      )
    }

    const existing = await prisma.interviewTemplate.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Interview template not found" },
        { status: 404 }
      )
    }

    if (existing.companyId !== user.companyId) {
      return NextResponse.json(
        { error: "Access denied to this template" },
        { status: 403 }
      )
    }

    // Delete questions first, then the template
    await prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({
        where: { templateId: params.id },
      })
      await tx.interviewTemplate.delete({
        where: { id: params.id },
      })
    })

    return NextResponse.json({ message: "Interview template deleted" })
  } catch (error) {
    console.error("DELETE /api/interviews/[id] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
