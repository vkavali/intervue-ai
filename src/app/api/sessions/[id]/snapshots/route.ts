import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: sessionId } = await params;

  // Verify the user has access to this session
  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    select: {
      candidateId: true,
      interviewerId: true,
      company: { select: { id: true } },
    },
  });

  if (!interviewSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Only candidate, interviewer, or company admin can view snapshots
  const userId = session.user.id;
  const isCandidate = interviewSession.candidateId === userId;
  const isInterviewer = interviewSession.interviewerId === userId;
  const isAdmin = session.user.role === "COMPANY_ADMIN";

  if (!isCandidate && !isInterviewer && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const snapshots = await prisma.codeSnapshot.findMany({
    where: { sessionId },
    orderBy: { timestamp: "asc" },
    select: {
      id: true,
      code: true,
      language: true,
      questionIndex: true,
      timestamp: true,
    },
  });

  return NextResponse.json(snapshots);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: sessionId } = await params;
  const body = await req.json();

  const { code, language, questionIndex } = body as {
    code: string;
    language: string;
    questionIndex: number;
  };

  if (!code || !language || questionIndex === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Limit code size to 500KB
  if (code.length > 500_000) {
    return NextResponse.json({ error: "Code too large" }, { status: 400 });
  }

  const snapshot = await prisma.codeSnapshot.create({
    data: {
      sessionId,
      code,
      language,
      questionIndex,
    },
  });

  return NextResponse.json({ id: snapshot.id }, { status: 201 });
}
