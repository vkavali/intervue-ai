import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/jobs - List open public positions (no auth required)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const department = searchParams.get("department")
    const seniority = searchParams.get("seniority")
    const location = searchParams.get("location")
    const company = searchParams.get("company")
    const search = searchParams.get("search")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: "OPEN",
      isPublic: true,
    }

    if (department) where.department = department
    if (seniority) where.seniority = seniority
    if (location) where.location = { contains: location, mode: "insensitive" }
    if (company) where.companyId = company
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { role: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const positions = await prisma.openPosition.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, logo: true, slug: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    // Get distinct filter values
    const allPositions = await prisma.openPosition.findMany({
      where: { status: "OPEN", isPublic: true },
      select: { department: true, seniority: true, location: true },
    })

    const departments = Array.from(new Set(allPositions.map(p => p.department).filter(Boolean)))
    const seniorities = Array.from(new Set(allPositions.map(p => p.seniority)))
    const locations = Array.from(new Set(allPositions.map(p => p.location).filter(Boolean)))

    return NextResponse.json({
      positions: positions.map(p => ({
        id: p.id,
        title: p.title,
        role: p.role,
        seniority: p.seniority,
        department: p.department,
        location: p.location,
        description: p.description,
        requirements: p.requirements,
        benefits: p.benefits,
        salaryMin: p.salaryMin,
        salaryMax: p.salaryMax,
        salaryCurrency: p.salaryCurrency,
        company: p.company,
        applicationCount: p._count.applications,
        createdAt: p.createdAt,
      })),
      filters: { departments, seniorities, locations },
      total: positions.length,
    })
  } catch (error) {
    console.error("GET /api/jobs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
