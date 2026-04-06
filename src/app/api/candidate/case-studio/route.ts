import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkIpRateLimit, checkUserRateLimit } from "@/lib/rate-limiter";
import { getInterviewType } from "@/data/interview-types";
import { generateCaseStudio } from "@/lib/ai-case-studio";

function getRequestIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  try {
    const ip = getRequestIp(req);
    const ipCheck = checkIpRateLimit(ip, "ai");
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: "Too many AI requests. Please wait a minute and try again." },
        { status: 429, headers: { "Retry-After": String(ipCheck.retryAfter) } }
      );
    }

    const session = await getServerSession(authOptions).catch(() => null);
    if (session?.user?.role === "CANDIDATE") {
      const userCheck = checkUserRateLimit(session.user.id, "coaching", null);
      if (!userCheck.allowed) {
        return NextResponse.json(
          { error: "Daily AI coaching limit reached. Please try again later." },
          { status: 429, headers: { "Retry-After": String(userCheck.resetIn) } }
        );
      }
    }

    const body = await req.json();
    const {
      targetRole,
      interviewType,
      seniority,
      industry,
      scenarioFocus,
      companyContext,
    } = body;

    if (!targetRole || !interviewType || !seniority || !industry) {
      return NextResponse.json(
        { error: "targetRole, interviewType, seniority, and industry are required" },
        { status: 400 }
      );
    }

    const typeConfig = getInterviewType(interviewType);
    const studio = await generateCaseStudio({
      targetRole,
      interviewType,
      seniority,
      industry,
      scenarioFocus,
      companyContext,
      interviewTypeLabel: typeConfig?.label,
      interviewTypeDescription: typeConfig?.description,
      sampleTopics: typeConfig?.sampleTopics,
    });

    return NextResponse.json({ studio });
  } catch (error) {
    console.error("POST /api/candidate/case-studio error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate case studio output";
    const status =
      message.includes("temporarily unavailable") || message.includes("not configured")
        ? 503
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
