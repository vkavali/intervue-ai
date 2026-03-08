import { NextRequest, NextResponse } from "next/server"

const MAX_CODE_LENGTH = 10000
const TIMEOUT_MS = 10000

// Self-hosted Piston or Judge0 URL from environment
const PISTON_URL = process.env.PISTON_URL // e.g., "https://your-piston.railway.app/api/v2/piston/execute"
const JUDGE0_URL = process.env.JUDGE0_URL // e.g., "https://judge0-ce.p.rapidapi.com"
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY

// Language configs for Piston
const PISTON_LANGUAGES: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "*" },
  typescript: { language: "typescript", version: "*" },
  python: { language: "python", version: "*" },
  java: { language: "java", version: "*" },
  cpp: { language: "c++", version: "*" },
  go: { language: "go", version: "*" },
  rust: { language: "rust", version: "*" },
}

// Language IDs for Judge0
const JUDGE0_LANGUAGES: Record<string, number> = {
  javascript: 63, // Node.js
  typescript: 74,
  python: 71, // Python 3
  java: 62,
  cpp: 54, // C++ (GCC)
  go: 60,
  rust: 73,
}

const SUPPORTED_LANGUAGES = ["javascript", "typescript", "python", "java", "cpp", "go", "rust"]

async function executePiston(language: string, code: string): Promise<{ output: string; error: string; exitCode: number }> {
  const langConfig = PISTON_LANGUAGES[language]
  if (!langConfig) throw new Error(`Unsupported language: ${language}`)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(PISTON_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [{ content: code }],
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error("Piston API error:", res.status, errorText)
      throw new Error("Piston execution failed")
    }

    const result = await res.json()
    const run = result.run
    return {
      output: run?.output ?? "",
      error: run?.stderr ?? "",
      exitCode: run?.code ?? 1,
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function executeJudge0(language: string, code: string): Promise<{ output: string; error: string; exitCode: number }> {
  const langId = JUDGE0_LANGUAGES[language]
  if (!langId) throw new Error(`Unsupported language: ${language}`)

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (JUDGE0_API_KEY) {
    headers["X-RapidAPI-Key"] = JUDGE0_API_KEY
    headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com"
  }

  // Submit
  const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      language_id: langId,
      source_code: Buffer.from(code).toString("base64"),
    }),
  })

  if (!submitRes.ok) {
    throw new Error("Judge0 submission failed")
  }

  const result = await submitRes.json()

  const stdout = result.stdout ? Buffer.from(result.stdout, "base64").toString() : ""
  const stderr = result.stderr ? Buffer.from(result.stderr, "base64").toString() : ""
  const compileError = result.compile_output ? Buffer.from(result.compile_output, "base64").toString() : ""

  return {
    output: stdout,
    error: stderr || compileError,
    exitCode: result.status?.id === 3 ? 0 : 1, // status 3 = Accepted
  }
}

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

    // Try available execution backends
    if (PISTON_URL) {
      try {
        const result = await executePiston(langKey, code)
        return NextResponse.json(result)
      } catch (err) {
        console.error("Piston execution error:", err)
      }
    }

    if (JUDGE0_URL) {
      try {
        const result = await executeJudge0(langKey, code)
        return NextResponse.json(result)
      } catch (err) {
        console.error("Judge0 execution error:", err)
      }
    }

    // For JavaScript/TypeScript, suggest client-side execution
    if (langKey === "javascript" || langKey === "typescript") {
      return NextResponse.json(
        { error: "USE_CLIENT_EXECUTION", output: "", exitCode: 1 },
        { status: 200 }
      )
    }

    // No execution backend available
    return NextResponse.json(
      { error: "No code execution service configured. Set PISTON_URL or JUDGE0_URL environment variable. JavaScript runs client-side.", output: "", exitCode: 1 },
      { status: 200 }
    )
  } catch (error) {
    console.error("POST /api/execute error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
