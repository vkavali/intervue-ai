-- AlterTable: Make userId optional for global bank problems
ALTER TABLE "PracticeProblem" ALTER COLUMN "userId" DROP NOT NULL;

-- AddColumn: bankId for original generated-bank IDs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PracticeProblem' AND column_name='bankId') THEN
    ALTER TABLE "PracticeProblem" ADD COLUMN "bankId" TEXT;
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "PracticeProblem_bankId_key" ON "PracticeProblem"("bankId");

-- AddColumn: category, pattern, hints for bank problem metadata
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PracticeProblem' AND column_name='category') THEN
    ALTER TABLE "PracticeProblem" ADD COLUMN "category" TEXT;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PracticeProblem' AND column_name='pattern') THEN
    ALTER TABLE "PracticeProblem" ADD COLUMN "pattern" TEXT;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PracticeProblem' AND column_name='hints') THEN
    ALTER TABLE "PracticeProblem" ADD COLUMN "hints" TEXT;
  END IF;
END $$;
