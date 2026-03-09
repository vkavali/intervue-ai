import { NextRequest, NextResponse } from "next/server"
import { executeCode, SUPPORTED_LANGUAGES } from "@/lib/code-executor"

const MAX_CODE_LENGTH = 10000

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { language, code } = body

    if (!language || typeof language !== "string") {
      return NextResponse.json({ error: "language is required" }, { status: 400 })
    }
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "code is required" }, { status: 400 })
    }

    const langKey = language.toLowerCase()
    if (!SUPPORTED_LANGUAGES.includes(langKey)) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}. Supported: ${SUPPORTED_LANGUAGES.join(", ")}` },
        { status: 400 }
      )
    }

    if (code.length > MAX_CODE_LENGTH) {
      return NextResponse.json({ error: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters` }, { status: 400 })
    }

    try {
      const result = await executeCode(langKey, code)
      return NextResponse.json(result)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)

      // For JS/TS, suggest client-side execution when no backend available
      if (msg.startsWith("NO_BACKEND:") && (langKey === "javascript" || langKey === "typescript")) {
        return NextResponse.json(
          { error: "USE_CLIENT_EXECUTION", output: "", exitCode: 1 },
          { status: 200 }
        )
      }

      // No execution backend available
      if (msg.startsWith("NO_BACKEND:")) {
        return NextResponse.json(
          { error: "No code execution service available for this language. JavaScript/TypeScript run client-side.", output: "", exitCode: 1 },
          { status: 200 }
        )
      }

      // Execution error (e.g. local execution failed)
      console.error("Execution error:", err)
      return NextResponse.json(
        { error: "Code execution failed. Please try again.", output: "", exitCode: 1 },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("POST /api/execute error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
