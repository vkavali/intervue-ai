import { NextRequest, NextResponse } from "next/server"
import { getAIResponse } from "@/lib/ai-levels"

// POST /api/sessions/practice-ai - AI endpoint for practice mode (no database)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, code, questionContext, aiLevel } = body

    // Validate required fields
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "prompt is required and must be a string" },
        { status: 400 }
      )
    }

    if (typeof aiLevel !== "number" || aiLevel < 0 || aiLevel > 4) {
      return NextResponse.json(
        { error: "aiLevel must be a number between 0 and 4" },
        { status: 400 }
      )
    }

    // Level 0 means AI is locked
    if (aiLevel === 0) {
      return NextResponse.json({
        response:
          "AI assistance is locked. Please select a higher AI level to get help.",
      })
    }

    // Call the shared AI response function (no session/database interaction)
    const response = await getAIResponse({
      level: aiLevel,
      prompt,
      code: code || "",
      questionContext: questionContext || "",
    })

    return NextResponse.json({ response })
  } catch (error) {
    console.error("POST /api/sessions/practice-ai error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
