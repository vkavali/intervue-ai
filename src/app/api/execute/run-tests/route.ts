import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { executeCode, SUPPORTED_LANGUAGES } from "@/lib/code-executor"
import { wrapTestCode, normalizeOutput, supportsTestCases } from "@/lib/test-adapters"

const MAX_CODE_LENGTH = 10000
const MAX_TEST_CASES = 20
const PER_TEST_TIMEOUT = 15000

interface TestCaseInput {
  input: string
  expected: string
}

interface TestCaseResult {
  input: string
  expected: string
  actual: string
  passed: boolean
  runtime: number
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { language, code, testCases } = body

    if (!language || typeof language !== "string") {
      return NextResponse.json({ error: "language is required" }, { status: 400 })
    }
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "code is required" }, { status: 400 })
    }
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json({ error: "testCases array is required" }, { status: 400 })
    }

    const langKey = language.toLowerCase()
    if (!SUPPORTED_LANGUAGES.includes(langKey)) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      )
    }

    if (code.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        { error: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters` },
        { status: 400 }
      )
    }

    if (!supportsTestCases(langKey)) {
      return NextResponse.json(
        { error: `Test cases are not yet supported for ${language}. Use Run Code instead.` },
        { status: 400 }
      )
    }

    const cases: TestCaseInput[] = testCases.slice(0, MAX_TEST_CASES)
    const results: TestCaseResult[] = []

    // Execute tests sequentially to avoid overloading
    for (const tc of cases) {
      const start = Date.now()
      try {
        const wrappedCode = wrapTestCode(langKey, code, tc.input)

        // Execute with a timeout wrapper
        const resultPromise = executeCode(langKey, wrappedCode)
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Test execution timed out")), PER_TEST_TIMEOUT)
        )

        const result = await Promise.race([resultPromise, timeoutPromise])
        const runtime = Date.now() - start
        const actual = (result.output || "").trim()
        const passed = result.exitCode === 0 && !result.error && normalizeOutput(actual, tc.expected.trim())

        results.push({
          input: tc.input,
          expected: tc.expected.trim(),
          actual: result.error ? `Error: ${result.error}` : actual,
          passed,
          runtime,
        })
      } catch (err) {
        const runtime = Date.now() - start
        const msg = err instanceof Error ? err.message : "Execution error"
        results.push({
          input: tc.input,
          expected: tc.expected.trim(),
          actual: msg.startsWith("NO_BACKEND:") ? "No execution backend available" : `Error: ${msg}`,
          passed: false,
          runtime,
        })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("POST /api/execute/run-tests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
