import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/jobs/[id]/apply - Submit job application (no auth required)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const position = await prisma.openPosition.findUnique({
      where: { id: params.id },
    })

    if (!position || !position.isPublic || position.status !== "OPEN") {
      return NextResponse.json({ error: "Position not found or not accepting applications" }, { status: 404 })
    }

    const body = await req.json()
    const { name, email, phone, resumeUrl, coverLetter, linkedinUrl } = body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check for duplicate application
    const existing = await prisma.jobApplication.findUnique({
      where: {
        positionId_email: {
          positionId: params.id,
          email: normalizedEmail,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "You have already applied for this position" },
        { status: 409 }
      )
    }

    const application = await prisma.jobApplication.create({
      data: {
        positionId: params.id,
        name: name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || null,
        resumeUrl: resumeUrl?.trim() || null,
        coverLetter: coverLetter?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
      },
    })

    return NextResponse.json(
      { id: application.id, message: "Application submitted successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/jobs/[id]/apply error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
