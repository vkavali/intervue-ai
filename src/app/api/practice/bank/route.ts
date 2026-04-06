import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/practice/bank - Fetch generated bank problems from DB
// Query params: ?id=gen-1 (optional, fetch single problem by bankId)
export async function GET(req: NextRequest) {
  try {
    const bankId = req.nextUrl.searchParams.get("id")

    if (bankId) {
      const problem = await prisma.practiceProblem.findFirst({
        where: { bankId, userId: null },
      })
      if (!problem) {
        return NextResponse.json({ error: "Problem not found" }, { status: 404 })
      }
      return NextResponse.json({
        problem: serializeProblem(problem),
      })
    }

    // Fetch all global bank problems (userId = null, bankId != null)
    const problems = await prisma.practiceProblem.findMany({
      where: { userId: null, bankId: { not: null } },
      select: {
        bankId: true,
        title: true,
        difficulty: true,
        description: true,
        tags: true,
        category: true,
        pattern: true,
        company: true,
      },
      orderBy: { bankId: "asc" },
    })

    return NextResponse.json({
      problems: problems.map((p) => ({
        id: p.bankId,
        title: p.title,
        difficulty: p.difficulty,
        description: p.description,
        tags: safeParseJSON(p.tags, []),
        category: p.category,
        pattern: p.pattern,
        company: p.company,
      })),
    })
  } catch (error) {
    console.error("GET /api/practice/bank error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function safeParseJSON(str: string | null, fallback: unknown) {
  if (!str) return fallback
  try { return JSON.parse(str) } catch { return fallback }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeProblem(p: any) {
  return {
    id: p.bankId || p.id,
    title: p.title,
    difficulty: p.difficulty,
    description: p.description,
    constraints: p.constraints,
    examples: p.examples,
    tags: safeParseJSON(p.tags, []),
    category: p.category,
    pattern: p.pattern,
    hints: safeParseJSON(p.hints, []),
    starterCode: safeParseJSON(p.starterCode, {}),
    testCases: safeParseJSON(p.testCases, []),
    company: p.company,
  }
}
