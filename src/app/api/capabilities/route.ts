import { NextResponse } from "next/server"
import { getAvailableBackend, getSupportedLanguages } from "@/lib/code-executor"
import { supportsTestCases } from "@/lib/test-adapters"

interface LanguageCapability {
  editor: boolean
  run: boolean
  testCases: boolean
  backend: string | null
}

// All languages that have editor support (Monaco editor can highlight them)
const ALL_EDITOR_LANGUAGES = ["javascript", "typescript", "python", "java", "cpp", "go", "rust"]

let cachedResponse: Record<string, LanguageCapability> | null = null

function buildCapabilities(): Record<string, LanguageCapability> {
  if (cachedResponse) return cachedResponse

  const supported = getSupportedLanguages()
  const capabilities: Record<string, LanguageCapability> = {}

  for (const lang of ALL_EDITOR_LANGUAGES) {
    const backend = getAvailableBackend(lang)
    capabilities[lang] = {
      editor: true,
      run: supported.includes(lang) && backend !== null,
      testCases: supportsTestCases(lang) && backend !== null,
      backend,
    }
  }

  cachedResponse = capabilities
  return capabilities
}

export async function GET() {
  const languages = buildCapabilities()
  return NextResponse.json(
    { languages },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  )
}
