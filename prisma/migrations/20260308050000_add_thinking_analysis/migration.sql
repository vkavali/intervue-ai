-- CreateTable
CREATE TABLE "ThinkingAnalysis" (
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
CREATE UNIQUE INDEX "ThinkingAnalysis_sessionId_key" ON "ThinkingAnalysis"("sessionId");

-- AddForeignKey
ALTER TABLE "ThinkingAnalysis" ADD CONSTRAINT "ThinkingAnalysis_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
