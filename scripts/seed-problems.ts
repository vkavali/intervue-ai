/**
 * Seed script: imports problems from src/data/generated-bank.ts into the
 * PracticeProblem table (with userId=null to mark them as global bank entries).
 *
 * Run: npx tsx scripts/seed-problems.ts
 *
 * Requires DATABASE_URL in environment.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { GENERATED_PROBLEMS } from "../src/data/generated-bank";

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 5,
    connectionTimeoutMillis: 10000,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log(`Seeding ${GENERATED_PROBLEMS.length} problems into PracticeProblem table...`);

  let created = 0;
  let skipped = 0;
  const BATCH_SIZE = 100;

  for (let i = 0; i < GENERATED_PROBLEMS.length; i += BATCH_SIZE) {
    const batch = GENERATED_PROBLEMS.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map((p) =>
        prisma.practiceProblem.upsert({
          where: { bankId: p.id },
          update: {
            title: p.title,
            difficulty: p.difficulty,
            description: p.description,
            constraints: p.constraints || null,
            examples: p.examples || null,
            tags: JSON.stringify(p.tags),
            category: p.category || null,
            pattern: p.pattern || null,
            hints: p.hints ? JSON.stringify(p.hints) : null,
            starterCode: p.starterCode ? JSON.stringify(p.starterCode) : null,
            testCases: p.testCases ? JSON.stringify(p.testCases) : null,
            company: p.company || null,
          },
          create: {
            bankId: p.id,
            userId: null,
            title: p.title,
            difficulty: p.difficulty,
            description: p.description,
            constraints: p.constraints || null,
            examples: p.examples || null,
            tags: JSON.stringify(p.tags),
            category: p.category || null,
            pattern: p.pattern || null,
            hints: p.hints ? JSON.stringify(p.hints) : null,
            starterCode: p.starterCode ? JSON.stringify(p.starterCode) : null,
            testCases: p.testCases ? JSON.stringify(p.testCases) : null,
            company: p.company || null,
          },
        })
      )
    );

    for (const r of results) {
      if (r.status === "fulfilled") created++;
      else skipped++;
    }

    console.log(`  Processed ${Math.min(i + BATCH_SIZE, GENERATED_PROBLEMS.length)}/${GENERATED_PROBLEMS.length}`);
  }

  console.log(`Done. Created/updated: ${created}, failed: ${skipped}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
