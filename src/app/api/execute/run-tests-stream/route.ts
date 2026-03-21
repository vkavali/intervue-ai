import { NextRequest } from "next/server";
import { executeCode } from "@/lib/code-executor";
import { wrapTestCode, normalizeOutput, supportsTestCases } from "@/lib/test-adapters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TestCase {
  input: string;
  expected: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { language, code, testCases } = body as {
    language: string;
    code: string;
    testCases: TestCase[];
  };

  if (!language || !code || !Array.isArray(testCases) || testCases.length === 0) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!supportsTestCases(language)) {
    return new Response(JSON.stringify({ error: `Test cases not supported for ${language}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send total count first
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "start", total: testCases.length })}\n\n`)
      );

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const startTime = Date.now();

        try {
          const wrappedCode = wrapTestCode(language, code, tc.input);
          const result = await executeCode(language, wrappedCode);
          const runtime = Date.now() - startTime;
          const actual = result.error ? `Error: ${result.error}` : result.output.trim();
          const passed = result.error ? false : normalizeOutput(actual, tc.expected);

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "result",
                index: i,
                input: tc.input,
                expected: tc.expected,
                actual,
                passed,
                runtime,
              })}\n\n`
            )
          );
        } catch (err) {
          const runtime = Date.now() - startTime;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "result",
                index: i,
                input: tc.input,
                expected: tc.expected,
                actual: `Execution error: ${err instanceof Error ? err.message : "Unknown error"}`,
                passed: false,
                runtime,
              })}\n\n`
            )
          );
        }
      }

      // Send completion event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
