-- AlterTable
ALTER TABLE "AuditReport" ADD COLUMN "shareToken" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "profilePublic" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "AuditReport_shareToken_key" ON "AuditReport"("shareToken");
