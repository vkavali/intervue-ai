import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/migrate - Run pending schema migrations
// This endpoint exists because `prisma db push` cannot connect via the adapter.
// Hit this endpoint once to add new columns and tables.
export async function GET() {
  const results: string[] = []

  try {
    // === Add new columns to existing tables ===

    // User: activeSessionToken, lastLoginAt, lastLoginIp
    await safeExec(
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "activeSessionToken" TEXT`,
      "User.activeSessionToken",
      results
    )
    await safeExec(
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3)`,
      "User.lastLoginAt",
      results
    )
    await safeExec(
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginIp" TEXT`,
      "User.lastLoginIp",
      results
    )

    // InterviewTemplate: industry, interviewType, totalDurationMinutes
    await safeExec(
      `ALTER TABLE "InterviewTemplate" ADD COLUMN IF NOT EXISTS "industry" TEXT`,
      "InterviewTemplate.industry",
      results
    )
    await safeExec(
      `ALTER TABLE "InterviewTemplate" ADD COLUMN IF NOT EXISTS "interviewType" TEXT DEFAULT 'TECHNICAL'`,
      "InterviewTemplate.interviewType",
      results
    )
    await safeExec(
      `ALTER TABLE "InterviewTemplate" ADD COLUMN IF NOT EXISTS "totalDurationMinutes" INTEGER`,
      "InterviewTemplate.totalDurationMinutes",
      results
    )

    // InterviewSession: totalDurationMinutes
    await safeExec(
      `ALTER TABLE "InterviewSession" ADD COLUMN IF NOT EXISTS "totalDurationMinutes" INTEGER`,
      "InterviewSession.totalDurationMinutes",
      results
    )

    // === Create new tables ===

    // Violation
    await safeExec(
      `CREATE TABLE IF NOT EXISTS "Violation" (
        "id" TEXT NOT NULL,
        "sessionId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "details" TEXT,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Violation_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Violation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Violation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`,
      "Violation table",
      results
    )

    // ChatMessage
    await safeExec(
      `CREATE TABLE IF NOT EXISTS "ChatMessage" (
        "id" TEXT NOT NULL,
        "sessionId" TEXT NOT NULL,
        "senderId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`,
      "ChatMessage table",
      results
    )

    // SessionLog
    await safeExec(
      `CREATE TABLE IF NOT EXISTS "SessionLog" (
        "id" TEXT NOT NULL,
        "sessionId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "details" TEXT,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SessionLog_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "SessionLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "SessionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`,
      "SessionLog table",
      results
    )

    // InterviewerAvailability
    await safeExec(
      `CREATE TABLE IF NOT EXISTS "InterviewerAvailability" (
        "id" TEXT NOT NULL,
        "interviewerId" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "InterviewerAvailability_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "InterviewerAvailability_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`,
      "InterviewerAvailability table",
      results
    )

    // EnrichedBankProblem
    await safeExec(
      `CREATE TABLE IF NOT EXISTS "EnrichedBankProblem" (
        "id" TEXT NOT NULL,
        "bankProblemId" TEXT NOT NULL,
        "constraints" TEXT,
        "examples" TEXT,
        "starterCode" TEXT,
        "testCases" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "EnrichedBankProblem_pkey" PRIMARY KEY ("id")
      )`,
      "EnrichedBankProblem table",
      results
    )

    // Add unique index on EnrichedBankProblem.bankProblemId
    await safeExec(
      `CREATE UNIQUE INDEX IF NOT EXISTS "EnrichedBankProblem_bankProblemId_key" ON "EnrichedBankProblem"("bankProblemId")`,
      "EnrichedBankProblem unique index",
      results
    )

    return NextResponse.json({
      success: true,
      message: "Migration completed",
      results,
    })
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        results,
      },
      { status: 500 }
    )
  }
}

async function safeExec(sql: string, label: string, results: string[]) {
  try {
    await prisma.$executeRawUnsafe(sql)
    results.push(`OK: ${label}`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    // "already exists" is fine
    if (msg.includes("already exists") || msg.includes("duplicate")) {
      results.push(`SKIP: ${label} (already exists)`)
    } else {
      results.push(`FAIL: ${label} - ${msg}`)
      throw err
    }
  }
}
