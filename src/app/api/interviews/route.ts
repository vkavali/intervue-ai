import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/interviews - List interview templates for the user's company
export async function GET(_req: NextRequest) {
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

    const templates = await prisma.interviewTemplate.findMany({
      where: { companyId: user.companyId },
      include: { questions: { orderBy: { orderIndex: "asc" } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("GET /api/interviews error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/interviews - Create a new interview template
export async function POST(req: NextRequest) {
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
        { error: "Only company admins can create interview templates" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { title, role, seniority, roundType, defaultAiLevel, questions } = body

    if (!title || !role || !seniority || !roundType) {
      return NextResponse.json(
        { error: "Missing required fields: title, role, seniority, roundType" },
        { status: 400 }
      )
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "At least one question is required" },
        { status: 400 }
      )
    }

    const template = await prisma.interviewTemplate.create({
      data: {
        companyId: user.companyId,
        title,
        role,
        seniority,
        roundType,
        defaultAiLevel: defaultAiLevel ?? 0,
        questions: {
          create: questions.map(
            (
              q: {
                title: string
                description: string
                constraints?: string
                examples?: string
                difficulty: string
                aiLevel?: number
                timeLimit: number
                testCases?: string | null
                starterCode?: string | null
              },
              index: number
            ) => ({
              title: q.title,
              description: q.description,
              constraints: q.constraints ?? null,
              examples: q.examples ?? null,
              difficulty: q.difficulty,
              aiLevel: q.aiLevel ?? defaultAiLevel ?? 0,
              timeLimit: q.timeLimit,
              orderIndex: index,
              testCases: q.testCases ?? null,
              starterCode: q.starterCode ?? null,
            })
          ),
        },
      },
      include: { questions: { orderBy: { orderIndex: "asc" } } },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("POST /api/interviews error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
