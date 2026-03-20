import { prisma } from '@/lib/prisma'

const COUNTER_ID = 'india-launch-2026'

export async function getLaunchOfferStatus() {
  const counter = await prisma.launchOfferCounter.upsert({
    where: { id: COUNTER_ID },
    create: { id: COUNTER_ID, count: 0, maxCount: 100 },
    update: {},
  })

  return {
    claimed: counter.count,
    remaining: counter.maxCount - counter.count,
    isActive: counter.count < counter.maxCount,
  }
}

export async function claimLaunchOfferSlot(): Promise<boolean> {
  // Atomic increment — only succeeds if count < maxCount
  const result = await prisma.launchOfferCounter.updateMany({
    where: {
      id: COUNTER_ID,
      count: { lt: 100 },
    },
    data: {
      count: { increment: 1 },
    },
  })

  return result.count > 0
}
