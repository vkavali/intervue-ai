import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { checkUserRateLimit } from "@/lib/rate-limiter";
import { validateGenerationPrompt } from "@/lib/ai-prompt-validator";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// POST /api/practice/generate - Generate practice problems from company/role/JD
export async function POST(req: NextRequest) {
  try {
    if (!anthropic) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);

    // Rate limit check
    let userId = "anonymous";
    let plan: string | null = null;

    if (session?.user) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: { company: true },
      });
      if (user) {
        userId = user.id;
        plan = user.company?.plan || null;
      }
    }

    const rateCheck = checkUserRateLimit(userId, "aiGenerations", plan);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Question generation limit reached (${rateCheck.limit}/day). ${session?.user ? "Upgrade your plan for more." : "Sign in for more generations."}`,
          remaining: 0,
          limit: rateCheck.limit,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.resetIn) },
        }
      );
    }

    const body = await req.json();
    const { company, role, jobDescription, difficulty, count, drillPattern, drillDifficulty } = body;

    // Validate prompt content
    const validation = validateGenerationPrompt({
      role,
      company,
      jobDescription,
      difficulty,
    });
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Drill mode doesn't require role
    if (!role && !drillPattern) {
      return NextResponse.json(
        { error: "Role is required (or use drillPattern for pattern drills)" },
        { status: 400 }
      );
    }

    const numProblems = Math.min(count || 3, 5);
    const isDrill = !!drillPattern;

    const prompt = isDrill
      ? `Generate ${numProblems} original coding practice problems that ALL focus exclusively on the "${drillPattern}" pattern/technique.

Target Difficulty: ${drillDifficulty || difficulty || "MEDIUM"}

IMPORTANT: Every problem MUST use the ${drillPattern} pattern as the core solving technique. Vary the problem context and scenarios but keep the underlying pattern the same.`
      : `Generate ${numProblems} original coding interview practice problems${company ? ` that ${company} might ask` : ""} for a ${role} position.

${jobDescription ? `Job Description Context:\n${jobDescription}\n` : ""}
${difficulty ? `Target Difficulty: ${difficulty}` : "Mix of difficulties (EASY, MEDIUM, HARD)"}

IMPORTANT RULES:
- Create ORIGINAL problems. Do NOT copy from LeetCode, HackerRank, or any copyrighted source.
- Problems should test skills relevant to the role and job description.
- Each problem should feel like a real interview question for that company/role.
- Focus on practical scenarios the candidate might face on the job.
- Ensure the problem is solvable and test cases match expected output.
- EVERY problem MUST include: constraints, examples, starter code (JS + Python + Java), and exactly 15 test cases with concrete input/output.

STARTER CODE RULES:
- Starter code must contain ONLY the function signature and a placeholder comment (e.g. "// Your solution here").
- Do NOT include any console.log, print, System.out.println, or any test calls in the starter code.
- Do NOT include any example usage or test harness in the starter code.
- The starter code should be CLEAN: just the function definition, nothing else.

TEST CASE RULES:
- Provide exactly 15 test cases per problem.
- Each test case "input" must be a valid JavaScript function call expression (e.g. "twoSum([2,7,11,15], 9)").
- Each test case "expected" must be the JSON-stringified expected result (e.g. "[0,1]").
- Include edge cases, boundary conditions, and typical cases.
- The first test case should be a simple, illustrative example.

Return a JSON array with this exact structure (no markdown, just pure JSON):
[
  {
    "id": "unique-slug-here",
    "title": "Problem Title",
    "difficulty": "EASY|MEDIUM|HARD",
    "description": "Full problem description with context",
    "constraints": "Input constraints and limits (REQUIRED - never leave empty)",
    "examples": "Input/Output examples with explanations (REQUIRED - include at least 2 examples)",
    "tags": ["Array", "Hash Table"],
    "starterCode": {
      "javascript": "function fnName(params) {\n  // Your solution here\n}",
      "python": "def fn_name(params):\n    # Your solution here\n    pass",
      "java": "class Solution {\n    public static ReturnType fnName(params) {\n        // Your solution here\n    }\n}"
    },
    "testCases": [
      { "input": "fnName([2,7,11,15], 9)", "expected": "[0,1]" }
    ]
  }
]

Make the problems practical and relevant. For example:
- For backend roles: API design, data processing, caching logic
- For frontend roles: DOM manipulation, state management, event handling
- For data roles: Data transformation, aggregation, analysis
- For system design roles: Rate limiter, URL shortener logic, LRU cache

Include exactly 15 test cases per problem. The test cases MUST be correct and verifiable.
Include at least JavaScript, Python, and Java starter code for each problem.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON from response
    let problems;
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        problems = JSON.parse(jsonMatch[0]);
      } else {
        problems = JSON.parse(text);
      }
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: text },
        { status: 500 }
      );
    }

    // Prefix drill problem IDs
    if (isDrill) {
      for (const problem of problems) {
        if (problem.id && !problem.id.startsWith("drill-")) {
          problem.id = `drill-${problem.id}`;
        }
      }
    }

    // Persist generated problems if user is logged in
    if (session?.user && userId !== "anonymous") {
      try {
        for (const problem of problems) {
          await prisma.practiceProblem.create({
            data: {
              userId,
              title: problem.title || "Untitled",
              difficulty: problem.difficulty || "MEDIUM",
              description: problem.description || "",
              constraints: problem.constraints || null,
              examples: problem.examples || null,
              tags: JSON.stringify(problem.tags || []),
              starterCode: problem.starterCode
                ? JSON.stringify(problem.starterCode)
                : null,
              testCases: problem.testCases
                ? JSON.stringify(problem.testCases)
                : null,
              company: company || null,
              role: role || null,
            },
          });
        }
      } catch (err) {
        // Don't fail the request if persistence fails
        console.error("Failed to persist practice problems:", err);
      }
    }

    return NextResponse.json({
      problems,
      remaining: rateCheck.remaining,
      limit: rateCheck.limit,
    });
  } catch (error) {
    console.error("Practice generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate practice problems" },
      { status: 500 }
    );
  }
}
