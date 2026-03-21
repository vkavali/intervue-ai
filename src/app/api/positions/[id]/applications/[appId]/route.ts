import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/positions/[id]/applications/[appId] - Update application status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; appId: string } }
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
      select: { companyId: true },
    })

    if (!position || position.companyId !== user.companyId) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 })
    }

    const body = await req.json()
    const { status } = body

    const validStatuses = ["NEW", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED"]
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    const application = await prisma.jobApplication.update({
      where: { id: params.appId },
      data: { status },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error("PATCH /api/positions/[id]/applications/[appId] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
