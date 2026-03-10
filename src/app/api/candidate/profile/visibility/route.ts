import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/candidate/profile/visibility - Toggle profilePublic
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "CANDIDATE") {
      return NextResponse.json(
        { error: "Only candidates can toggle profile visibility" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { profilePublic } = body

    if (typeof profilePublic !== "boolean") {
      return NextResponse.json(
        { error: "profilePublic must be a boolean" },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { profilePublic },
      select: { profilePublic: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/candidate/profile/visibility error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
