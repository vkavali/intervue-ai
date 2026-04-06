-- AlterTable: Make userId optional for global bank problems
ALTER TABLE "PracticeProblem" ALTER COLUMN "userId" DROP NOT NULL;

-- AddColumn: bankId for original generated-bank IDs
ALTER TABLE "PracticeProblem" ADD COLUMN "bankId" TEXT;
CREATE UNIQUE INDEX "PracticeProblem_bankId_key" ON "PracticeProblem"("bankId");

-- AddColumn: category, pattern, hints for bank problem metadata
ALTER TABLE "PracticeProblem" ADD COLUMN "category" TEXT;
ALTER TABLE "PracticeProblem" ADD COLUMN "pattern" TEXT;
ALTER TABLE "PracticeProblem" ADD COLUMN "hints" TEXT;
