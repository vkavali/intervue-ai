-- CreateTable
CREATE TABLE IF NOT EXISTS "ThinkingAnalysis" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "overallApproach" TEXT NOT NULL,
    "thinkingPatterns" TEXT NOT NULL,
    "problemSolvingStage" TEXT NOT NULL,
    "strengths" TEXT NOT NULL,
    "concerns" TEXT NOT NULL,
    "aiUsagePattern" TEXT NOT NULL,
    "suggestedFollowUp" TEXT NOT NULL,
    "confidenceLevel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThinkingAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ThinkingAnalysis_sessionId_key" ON "ThinkingAnalysis"("sessionId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ThinkingAnalysis_sessionId_fkey') THEN
    ALTER TABLE "ThinkingAnalysis" ADD CONSTRAINT "ThinkingAnalysis_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
