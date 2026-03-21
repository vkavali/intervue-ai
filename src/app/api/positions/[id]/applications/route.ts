import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/positions/[id]/applications - List applications for a position
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

    if (!user || user.role !== "COMPANY_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const position = await prisma.openPosition.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, role: true, companyId: true },
    })

    if (!position || position.companyId !== user.companyId) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 })
    }

    const applications = await prisma.jobApplication.findMany({
      where: { positionId: params.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ position, applications })
  } catch (error) {
    console.error("GET /api/positions/[id]/applications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
