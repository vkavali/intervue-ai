import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

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

    const body = await req.json();
    const { company, role, jobDescription, difficulty, count } = body;

    if (!role) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      );
    }

    const numProblems = Math.min(count || 3, 5);

    const prompt = `Generate ${numProblems} original coding interview practice problems${company ? ` that ${company} might ask` : ""} for a ${role} position.

${jobDescription ? `Job Description Context:\n${jobDescription}\n` : ""}
${difficulty ? `Target Difficulty: ${difficulty}` : "Mix of difficulties (EASY, MEDIUM, HARD)"}

IMPORTANT RULES:
- Create ORIGINAL problems. Do NOT copy from LeetCode, HackerRank, or any copyrighted source.
- Problems should test skills relevant to the role and job description.
- Each problem should feel like a real interview question for that company/role.
- Focus on practical scenarios the candidate might face on the job.

Return a JSON array with this exact structure (no markdown, just pure JSON):
[
  {
    "id": "unique-slug-here",
    "title": "Problem Title",
    "difficulty": "EASY|MEDIUM|HARD",
    "description": "Full problem description with context",
    "constraints": "Input constraints and limits",
    "examples": "Input/Output examples with explanations",
    "tags": ["Array", "Hash Table"],
    "starterCode": {
      "javascript": "// Starter code with function signature and test cases using console.log",
      "python": "# Starter code with function signature and test cases using print"
    }
  }
]

Make the problems practical and relevant. For example:
- For backend roles: API design, data processing, caching logic
- For frontend roles: DOM manipulation, state management, event handling
- For data roles: Data transformation, aggregation, analysis
- For system design roles: Rate limiter, URL shortener logic, LRU cache

Include at least JavaScript and Python starter code for each problem.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON from response
    let problems;
    try {
      // Try to extract JSON from the response
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

    return NextResponse.json({ problems });
  } catch (error) {
    console.error("Practice generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate practice problems" },
      { status: 500 }
    );
  }
}
