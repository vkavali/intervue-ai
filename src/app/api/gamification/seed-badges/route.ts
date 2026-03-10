import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BADGE_DEFINITIONS } from "@/lib/badge-definitions";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["COMPANY_ADMIN", "SCHOOL_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let created = 0;
    let skipped = 0;

    for (const badge of BADGE_DEFINITIONS) {
      const existing = await prisma.badge.findUnique({
        where: { slug: badge.slug },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.badge.create({
        data: {
          slug: badge.slug,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          category: badge.category,
          threshold: badge.threshold,
        },
      });
      created++;
    }

    return NextResponse.json({ created, skipped, total: BADGE_DEFINITIONS.length });
  } catch (error) {
    console.error("POST /api/gamification/seed-badges error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
