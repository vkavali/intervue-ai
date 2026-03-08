import { NextRequest, NextResponse } from "next/server"

const PISTON_API = "https://emkc.org/api/v2/piston/execute"
const MAX_CODE_LENGTH = 10000
const TIMEOUT_MS = 10000

// Map friendly language names to Piston language identifiers
const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "*" },
  typescript: { language: "typescript", version: "*" },
  python: { language: "python", version: "*" },
  java: { language: "java", version: "*" },
  cpp: { language: "c++", version: "*" },
  go: { language: "go", version: "*" },
  rust: { language: "rust", version: "*" },
}

const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_MAP)

// POST /api/execute - Execute code via Piston API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { language, code } = body

    // Validate required fields
    if (!language || typeof language !== "string") {
      return NextResponse.json(
        { error: "language is required and must be a string" },
        { status: 400 }
      )
    }

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "code is required and must be a string" },
        { status: 400 }
      )
    }

    // Validate language is supported
    const langKey = language.toLowerCase()
    const langConfig = LANGUAGE_MAP[langKey]

    if (!langConfig) {
      return NextResponse.json(
        {
          error: `Unsupported language: ${language}. Supported: ${SUPPORTED_LANGUAGES.join(", ")}`,
        },
        { status: 400 }
      )
    }

    // Enforce code length limit
    if (code.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        {
          error: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`,
        },
        { status: 400 }
      )
    }

    // Call Piston API with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    let pistonResponse: Response

    try {
      pistonResponse = await fetch(PISTON_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: langConfig.language,
          version: langConfig.version,
          files: [{ content: code }],
        }),
        signal: controller.signal,
      })
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return NextResponse.json(
          { error: "Code execution timed out", output: "", exitCode: 1 },
          { status: 408 }
        )
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }

    if (!pistonResponse.ok) {
      const errorText = await pistonResponse.text()
      console.error("Piston API error:", pistonResponse.status, errorText)
      return NextResponse.json(
        { error: "Code execution service error" },
        { status: 502 }
      )
    }

    const result = await pistonResponse.json()
    const run = result.run

    return NextResponse.json({
      output: run?.output ?? "",
      error: run?.stderr ?? "",
      exitCode: run?.code ?? 1,
    })
  } catch (error) {
    console.error("POST /api/execute error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
