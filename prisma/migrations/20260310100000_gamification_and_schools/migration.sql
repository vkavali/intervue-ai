-- AlterTable: Add gamification columns to User
ALTER TABLE "User" ADD COLUMN "xp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "level" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "User" ADD COLUMN "currentStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "longestStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lastActiveDate" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "schoolId" TEXT;

-- CreateTable: XPTransaction
CREATE TABLE "XPTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "XPTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Badge
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserBadge
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable: DailyActivity
CREATE TABLE "DailyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "problems" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable: DailyChallenge
CREATE TABLE "DailyChallenge" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "bonusXP" INTEGER NOT NULL DEFAULT 50,
    CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable: School
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enrollmentCode" TEXT NOT NULL,
    "maxStudents" INTEGER NOT NULL DEFAULT 100,
    "plan" TEXT NOT NULL DEFAULT 'EDUCATION',
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SchoolAssignment
CREATE TABLE "SchoolAssignment" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "problemIds" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SchoolAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Badge_slug_key" ON "Badge"("slug");
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");
CREATE UNIQUE INDEX "DailyActivity_userId_date_key" ON "DailyActivity"("userId", "date");
CREATE UNIQUE INDEX "DailyChallenge_date_key" ON "DailyChallenge"("date");
CREATE UNIQUE INDEX "School_enrollmentCode_key" ON "School"("enrollmentCode");
CREATE UNIQUE INDEX "School_adminId_key" ON "School"("adminId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "XPTransaction" ADD CONSTRAINT "XPTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DailyChallenge" ADD CONSTRAINT "DailyChallenge_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "PracticeProblem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "School" ADD CONSTRAINT "School_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
