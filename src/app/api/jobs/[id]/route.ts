import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/jobs/[id] - Single position detail (no auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const position = await prisma.openPosition.findUnique({
      where: { id: params.id },
      include: {
        company: { select: { id: true, name: true, logo: true, slug: true } },
      },
    })

    if (!position || !position.isPublic || position.status !== "OPEN") {
      return NextResponse.json({ error: "Position not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: position.id,
      title: position.title,
      role: position.role,
      seniority: position.seniority,
      department: position.department,
      location: position.location,
      description: position.description,
      requirements: position.requirements,
      benefits: position.benefits,
      salaryMin: position.salaryMin,
      salaryMax: position.salaryMax,
      salaryCurrency: position.salaryCurrency,
      company: position.company,
      createdAt: position.createdAt,
    })
  } catch (error) {
    console.error("GET /api/jobs/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
