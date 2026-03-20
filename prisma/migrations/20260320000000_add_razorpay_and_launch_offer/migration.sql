-- AlterTable: Company - add Razorpay and launch offer fields
ALTER TABLE "Company" ADD COLUMN "razorpayCustomerId" TEXT;
ALTER TABLE "Company" ADD COLUMN "razorpaySubscriptionId" TEXT;
ALTER TABLE "Company" ADD COLUMN "paymentGateway" TEXT;
ALTER TABLE "Company" ADD COLUMN "region" TEXT NOT NULL DEFAULT 'US';
ALTER TABLE "Company" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'usd';
ALTER TABLE "Company" ADD COLUMN "isLaunchOffer" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Company" ADD COLUMN "trialEndsAt" TIMESTAMP(3);

-- AlterTable: School - add Razorpay and region fields
ALTER TABLE "School" ADD COLUMN "razorpaySubscriptionId" TEXT;
ALTER TABLE "School" ADD COLUMN "paymentGateway" TEXT;
ALTER TABLE "School" ADD COLUMN "region" TEXT NOT NULL DEFAULT 'US';
ALTER TABLE "School" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'usd';

-- CreateTable: LaunchOfferCounter
CREATE TABLE "LaunchOfferCounter" (
    "id" TEXT NOT NULL DEFAULT 'india-launch-2026',
    "count" INTEGER NOT NULL DEFAULT 0,
    "maxCount" INTEGER NOT NULL DEFAULT 100,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaunchOfferCounter_pkey" PRIMARY KEY ("id")
);
