-- AlterTable: Question - add testCases and starterCode fields
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "testCases" TEXT;
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "starterCode" TEXT;
