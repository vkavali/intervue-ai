-- CreateTable: PracticeProblem (was missing from previous migrations)
CREATE TABLE IF NOT EXISTS "PracticeProblem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "constraints" TEXT,
    "examples" TEXT,
    "tags" TEXT NOT NULL,
    "starterCode" TEXT,
    "testCases" TEXT,
    "company" TEXT,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PracticeProgress (was missing from previous migrations)
CREATE TABLE IF NOT EXISTS "PracticeProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT,
    "bankProblemId" TEXT,
    "code" TEXT,
    "language" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "lastSavedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PracticeProgress_userId_problemId_key" ON "PracticeProgress"("userId", "problemId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PracticeProgress_userId_bankProblemId_key" ON "PracticeProgress"("userId", "bankProblemId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PracticeProblem_userId_fkey') THEN
    ALTER TABLE "PracticeProblem" ADD CONSTRAINT "PracticeProblem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PracticeProgress_userId_fkey') THEN
    ALTER TABLE "PracticeProgress" ADD CONSTRAINT "PracticeProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PracticeProgress_problemId_fkey') THEN
    ALTER TABLE "PracticeProgress" ADD CONSTRAINT "PracticeProgress_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "PracticeProblem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
