import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide a job description with at least 20 characters" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: `You are a job description parser. Extract structured data from job descriptions and return ONLY valid JSON with no other text. Use these exact field names:
- title: string (the job title)
- role: string (the role/function, e.g. "Frontend Engineer", "Backend Developer")
- seniority: string (one of: JUNIOR, MID, SENIOR, STAFF, PRINCIPAL — pick the best match)
- department: string or null (e.g. "Engineering", "Product")
- location: string or null (e.g. "Remote", "San Francisco, CA")
- description: string (a concise 2-3 sentence summary of the role)
- headcount: number (default to 1 if not specified)

Return ONLY the JSON object, no markdown, no explanation.`,
      messages: [
        {
          role: "user",
          content: `Parse this job description:\n\n${text.slice(0, 5000)}`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Failed to parse job description" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(textBlock.text);

    const validSeniorities = ["JUNIOR", "MID", "SENIOR", "STAFF", "PRINCIPAL"];
    if (!validSeniorities.includes(parsed.seniority)) {
      parsed.seniority = "MID";
    }

    return NextResponse.json({
      title: parsed.title || "",
      role: parsed.role || "",
      seniority: parsed.seniority || "MID",
      department: parsed.department || "",
      location: parsed.location || "",
      description: parsed.description || "",
      headcount: String(parsed.headcount || 1),
    });
  } catch (error) {
    console.error("POST /api/positions/parse error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
