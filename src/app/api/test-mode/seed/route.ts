import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BADGE_DEFINITIONS } from "@/lib/badge-definitions";
import bcrypt from "bcryptjs";

const DEMO_PASSWORD = "DemoPass123!";
const DEMO_DOMAIN = "@test.invalid";

function demoEmail(name: string) {
  return `demo-${name}${DEMO_DOMAIN}`;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Gate: only TEST_MODE_EMAIL user or COMPANY_ADMIN
    const testModeEmail = process.env.TEST_MODE_EMAIL;
    if (testModeEmail) {
      if (session.user.email !== testModeEmail) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else if (session.user.role !== "COMPANY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Idempotent: skip if demo data already exists
    const existingDemo = await prisma.user.findFirst({
      where: { email: { endsWith: DEMO_DOMAIN } },
    });
    if (existingDemo) {
      return NextResponse.json({ message: "Demo data already seeded", alreadySeeded: true });
    }

    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    const now = new Date();

    // ─── 1. Company ───────────────────────────────────────────────────────
    const company = await prisma.company.create({
      data: {
        name: "Demo Corp",
        slug: "demo-corp",
        plan: "ENTERPRISE",
        region: "US",
        currency: "usd",
      },
    });

    // ─── 2. Users ─────────────────────────────────────────────────────────
    const _admin = await prisma.user.create({
      data: {
        email: demoEmail("admin"),
        name: "Dana Admin",
        password: hashedPassword,
        role: "COMPANY_ADMIN",
        companyId: company.id,
        xp: 0,
        level: 1,
      },
    });

    const interviewer = await prisma.user.create({
      data: {
        email: demoEmail("interviewer"),
        name: "Ian Interviewer",
        password: hashedPassword,
        role: "INTERVIEWER",
        companyId: company.id,
        xp: 0,
        level: 1,
      },
    });

    const candidates = await Promise.all(
      [
        { slug: "alice", name: "Alice Candidate", xp: 350, level: 3, streak: 12, longest: 15 },
        { slug: "bob", name: "Bob Candidate", xp: 180, level: 2, streak: 5, longest: 8 },
        { slug: "carol", name: "Carol Candidate", xp: 50, level: 1, streak: 1, longest: 3 },
      ].map((c) =>
        prisma.user.create({
          data: {
            email: demoEmail(c.slug),
            name: c.name,
            password: hashedPassword,
            role: "CANDIDATE",
            xp: c.xp,
            level: c.level,
            currentStreak: c.streak,
            longestStreak: c.longest,
            lastActiveDate: now,
          },
        })
      )
    );

    const [alice, bob, carol] = candidates;

    // ─── 3. Interview Templates + Questions ───────────────────────────────
    const technicalTemplate = await prisma.interviewTemplate.create({
      data: {
        companyId: company.id,
        title: "Frontend Engineer Technical",
        role: "Frontend Engineer",
        seniority: "MID",
        roundType: "Technical",
        defaultAiLevel: 2,
        interviewType: "TECHNICAL",
        totalDurationMinutes: 60,
        questions: {
          create: [
            { title: "Two Sum", description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", difficulty: "EASY", aiLevel: 1, timeLimit: 15, orderIndex: 0, testCases: JSON.stringify([{ input: "twoSum([2,7,11,15], 9)", expected: "[0, 1]" }]) },
            { title: "LRU Cache", description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.", difficulty: "MEDIUM", aiLevel: 2, timeLimit: 20, orderIndex: 1, testCases: JSON.stringify([{ input: "LRUCache(2)", expected: "null" }]) },
            { title: "Debounce Implementation", description: "Implement a debounce function that delays invoking func until after wait milliseconds.", difficulty: "MEDIUM", aiLevel: 2, timeLimit: 15, orderIndex: 2 },
          ],
        },
      },
    });

    const sysDesignTemplate = await prisma.interviewTemplate.create({
      data: {
        companyId: company.id,
        title: "System Design Round",
        role: "Backend Engineer",
        seniority: "SENIOR",
        roundType: "System Design",
        defaultAiLevel: 1,
        interviewType: "SYSTEM_DESIGN",
        totalDurationMinutes: 45,
        questions: {
          create: [
            { title: "Design URL Shortener", description: "Design a URL shortening service like bit.ly. Consider scale, storage, and redirect latency.", difficulty: "MEDIUM", aiLevel: 1, timeLimit: 25, orderIndex: 0 },
            { title: "Design Chat System", description: "Design a real-time chat application supporting 1:1 and group messaging.", difficulty: "HARD", aiLevel: 1, timeLimit: 20, orderIndex: 1 },
          ],
        },
      },
    });

    const behavioralTemplate = await prisma.interviewTemplate.create({
      data: {
        companyId: company.id,
        title: "Behavioral Interview",
        role: "Frontend Engineer",
        seniority: "MID",
        roundType: "Behavioral",
        defaultAiLevel: 0,
        interviewType: "BEHAVIORAL",
        totalDurationMinutes: 30,
        questions: {
          create: [
            { title: "Conflict Resolution", description: "Tell me about a time you had a disagreement with a team member. How did you resolve it?", difficulty: "MEDIUM", aiLevel: 0, timeLimit: 10, orderIndex: 0 },
            { title: "Technical Leadership", description: "Describe a project where you took technical ownership and drove it to completion.", difficulty: "MEDIUM", aiLevel: 0, timeLimit: 10, orderIndex: 1 },
            { title: "Failure & Learning", description: "Tell me about a time something you built failed. What did you learn?", difficulty: "EASY", aiLevel: 0, timeLimit: 10, orderIndex: 2 },
          ],
        },
      },
    });

    // ─── 4. Interview Sessions (8 total) ──────────────────────────────────
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // COMPLETED sessions (4)
    const completedSessions = await Promise.all([
      prisma.interviewSession.create({
        data: {
          templateId: technicalTemplate.id, companyId: company.id,
          candidateId: alice.id, interviewerId: interviewer.id,
          status: "COMPLETED", aiLevel: 2,
          scheduledAt: tenDaysAgo, startedAt: tenDaysAgo,
          endedAt: new Date(tenDaysAgo.getTime() + 55 * 60 * 1000),
          code: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n}",
          language: "javascript",
        },
      }),
      prisma.interviewSession.create({
        data: {
          templateId: technicalTemplate.id, companyId: company.id,
          candidateId: bob.id, interviewerId: interviewer.id,
          status: "COMPLETED", aiLevel: 3,
          scheduledAt: fiveDaysAgo, startedAt: fiveDaysAgo,
          endedAt: new Date(fiveDaysAgo.getTime() + 50 * 60 * 1000),
          code: "def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target-n], i]\n        seen[n] = i",
          language: "python",
        },
      }),
      prisma.interviewSession.create({
        data: {
          templateId: sysDesignTemplate.id, companyId: company.id,
          candidateId: alice.id, interviewerId: interviewer.id,
          status: "COMPLETED", aiLevel: 1,
          scheduledAt: twoDaysAgo, startedAt: twoDaysAgo,
          endedAt: new Date(twoDaysAgo.getTime() + 40 * 60 * 1000),
          code: "// URL Shortener Design\n// Base62 encoding, Redis cache, PostgreSQL storage\n// Read:Write ratio ~ 100:1",
          language: "javascript",
        },
      }),
      prisma.interviewSession.create({
        data: {
          templateId: behavioralTemplate.id, companyId: company.id,
          candidateId: carol.id, interviewerId: interviewer.id,
          status: "COMPLETED", aiLevel: 0,
          scheduledAt: twoDaysAgo, startedAt: twoDaysAgo,
          endedAt: new Date(twoDaysAgo.getTime() + 28 * 60 * 1000),
          language: "javascript",
        },
      }),
    ]);

    // ACTIVE session (1)
    const activeSession = await prisma.interviewSession.create({
      data: {
        templateId: technicalTemplate.id, companyId: company.id,
        candidateId: carol.id, interviewerId: interviewer.id,
        status: "ACTIVE", aiLevel: 2,
        scheduledAt: now, startedAt: now,
        code: "// Working on it...\nfunction solve() {\n  \n}",
        language: "javascript",
      },
    });

    // PENDING sessions (2)
    const _pendingSessions = await Promise.all([
      prisma.interviewSession.create({
        data: {
          templateId: technicalTemplate.id, companyId: company.id,
          candidateId: bob.id, interviewerId: interviewer.id,
          status: "PENDING", aiLevel: 2,
          scheduledAt: tomorrow,
        },
      }),
      prisma.interviewSession.create({
        data: {
          templateId: sysDesignTemplate.id, companyId: company.id,
          candidateId: carol.id,
          status: "PENDING", aiLevel: 1,
          scheduledAt: nextWeek,
        },
      }),
    ]);

    // CANCELLED session (1)
    await prisma.interviewSession.create({
      data: {
        templateId: behavioralTemplate.id, companyId: company.id,
        candidateId: bob.id,
        status: "CANCELLED", aiLevel: 0,
        scheduledAt: fiveDaysAgo,
      },
    });

    // ─── 5. Audit Reports (on completed sessions) ─────────────────────────
    await Promise.all([
      prisma.auditReport.create({
        data: {
          sessionId: completedSessions[0].id, overallScore: 88,
          problemComprehension: 90, solutionCorrectness: 92, codeQuality: 85,
          communication: 88, aiUsageQuality: 82, timeManagement: 90,
          thinkingTrace: "Candidate demonstrated strong problem-solving approach. Started with brute force O(n^2) then optimized to hash map O(n).",
          riskFlags: JSON.stringify(["Slight hesitation on edge cases"]),
          quoteHighlights: JSON.stringify(["I'd use a hash map for O(1) lookups", "Let me consider the edge case where nums is empty"]),
          suggestedDecision: "HIRE", confidence: 0.85,
          reasoning: "Strong technical skills with good communication. Handled optimization well.",
        },
      }),
      prisma.auditReport.create({
        data: {
          sessionId: completedSessions[1].id, overallScore: 72,
          problemComprehension: 75, solutionCorrectness: 70, codeQuality: 68,
          communication: 78, aiUsageQuality: 65, timeManagement: 75,
          thinkingTrace: "Candidate needed more AI assistance than expected. Solution was correct but code style needs improvement.",
          riskFlags: JSON.stringify(["Heavy AI reliance", "Inconsistent variable naming"]),
          quoteHighlights: JSON.stringify(["I think we need a dictionary here"]),
          suggestedDecision: "FURTHER_ROUND", confidence: 0.60,
          reasoning: "Shows potential but needs further evaluation. AI dependency was high for a mid-level role.",
        },
      }),
      prisma.auditReport.create({
        data: {
          sessionId: completedSessions[2].id, overallScore: 92,
          problemComprehension: 95, solutionCorrectness: 90, codeQuality: 88,
          communication: 95, aiUsageQuality: 90, timeManagement: 92,
          thinkingTrace: "Excellent system design discussion. Covered scalability, caching, and failure modes comprehensively.",
          riskFlags: JSON.stringify([]),
          quoteHighlights: JSON.stringify(["The read-to-write ratio suggests we should optimize for reads", "We can use Base62 encoding for short URLs"]),
          suggestedDecision: "HIRE", confidence: 0.92,
          reasoning: "Outstanding system design knowledge. Ready for senior-level responsibilities.",
        },
      }),
      prisma.auditReport.create({
        data: {
          sessionId: completedSessions[3].id, overallScore: 65,
          problemComprehension: 70, solutionCorrectness: 60, codeQuality: 55,
          communication: 72, aiUsageQuality: 50, timeManagement: 68,
          thinkingTrace: "Behavioral answers were somewhat generic. Could use more specific STAR-format examples.",
          riskFlags: JSON.stringify(["Vague answers", "Limited concrete examples"]),
          quoteHighlights: JSON.stringify(["I usually try to talk things out with the team"]),
          suggestedDecision: "NO_HIRE", confidence: 0.55,
          reasoning: "Communication skills need development. Answers lacked specificity and depth.",
        },
      }),
    ]);

    // ─── 6. AI Interactions (3 per completed session = 12) ────────────────
    const aiInteractions = completedSessions.flatMap((s) => [
      { sessionId: s.id, prompt: "How should I approach this problem?", response: "Consider what data structure would allow O(1) lookups. Think about the trade-off between time and space complexity.", aiLevel: s.aiLevel, timestamp: new Date(s.startedAt!.getTime() + 5 * 60 * 1000) },
      { sessionId: s.id, prompt: "Is my solution correct so far?", response: "Your approach is on the right track. Consider edge cases like empty arrays or duplicate values.", aiLevel: s.aiLevel, timestamp: new Date(s.startedAt!.getTime() + 15 * 60 * 1000) },
      { sessionId: s.id, prompt: "How can I optimize this?", response: "Your current solution works but runs in O(n^2). Think about using a hash-based data structure to reduce lookup time.", aiLevel: s.aiLevel, timestamp: new Date(s.startedAt!.getTime() + 25 * 60 * 1000) },
    ]);
    await prisma.aIInteraction.createMany({ data: aiInteractions });

    // ─── 7. Open Positions (2) ────────────────────────────────────────────
    const fePosition = await prisma.openPosition.create({
      data: {
        companyId: company.id, title: "Frontend Engineer",
        role: "Frontend Engineer", seniority: "MID",
        department: "Engineering", location: "Remote (US)",
        description: "We are looking for a mid-level frontend engineer to join our growing team. You will work on our core product using React, TypeScript, and Next.js.",
        interviewType: "TECHNICAL", isPublic: true,
        requirements: "- 3+ years React experience\n- TypeScript proficiency\n- Understanding of web performance\n- Experience with testing frameworks",
        benefits: "- Competitive salary\n- Remote-first culture\n- Health insurance\n- Learning budget",
        salaryMin: 120000, salaryMax: 160000, salaryCurrency: "USD",
        headcount: 2, status: "OPEN",
      },
    });

    const bePosition = await prisma.openPosition.create({
      data: {
        companyId: company.id, title: "Backend Engineer",
        role: "Backend Engineer", seniority: "SENIOR",
        department: "Engineering", location: "Remote (Global)",
        description: "Senior backend engineer to architect and build scalable APIs and microservices.",
        interviewType: "SYSTEM_DESIGN", isPublic: true,
        requirements: "- 5+ years backend experience\n- Distributed systems knowledge\n- PostgreSQL & Redis\n- API design best practices",
        benefits: "- Top-of-market compensation\n- Equity package\n- Unlimited PTO\n- Home office stipend",
        salaryMin: 160000, salaryMax: 220000, salaryCurrency: "USD",
        headcount: 1, status: "OPEN",
      },
    });

    // ─── 8. Job Applications (5) ──────────────────────────────────────────
    await prisma.jobApplication.createMany({
      data: [
        { positionId: fePosition.id, name: "Alice Candidate", email: demoEmail("alice"), status: "SHORTLISTED" },
        { positionId: fePosition.id, name: "Bob Candidate", email: demoEmail("bob"), status: "REVIEWING" },
        { positionId: fePosition.id, name: "External Applicant 1", email: demoEmail("ext1"), status: "NEW" },
        { positionId: bePosition.id, name: "Alice Candidate", email: demoEmail("alice-be"), status: "SHORTLISTED" },
        { positionId: bePosition.id, name: "External Applicant 2", email: demoEmail("ext2"), status: "REJECTED" },
      ],
    });

    // ─── 9. Candidate Pipelines (3) ───────────────────────────────────────
    await prisma.candidatePipeline.createMany({
      data: [
        { companyId: company.id, candidateId: alice.id, role: "Frontend Engineer", seniority: "MID", stage: "TECHNICAL", notes: "Strong technical skills. Passed phone screen." },
        { companyId: company.id, candidateId: bob.id, role: "Frontend Engineer", seniority: "MID", stage: "SCREENING", notes: "Resume looks promising. Schedule phone screen." },
        { companyId: company.id, candidateId: alice.id, role: "Backend Engineer", seniority: "SENIOR", stage: "FINAL", notes: "Excellent system design round. Moving to final." },
      ],
    });

    // ─── 10. Practice Problems (3) ────────────────────────────────────────
    const practiceProblems = await Promise.all([
      prisma.practiceProblem.create({
        data: {
          userId: alice.id, title: "Reverse Linked List",
          difficulty: "EASY",
          description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
          tags: JSON.stringify(["linked-list", "recursion"]),
          starterCode: JSON.stringify({ javascript: "function reverseList(head) {\n  \n}", python: "def reverse_list(head):\n    pass" }),
          testCases: JSON.stringify([{ input: "reverseList([1,2,3,4,5])", expected: "[5,4,3,2,1]" }]),
        },
      }),
      prisma.practiceProblem.create({
        data: {
          userId: alice.id, title: "Binary Tree Level Order",
          difficulty: "MEDIUM",
          description: "Given the root of a binary tree, return the level order traversal of its nodes' values.",
          tags: JSON.stringify(["tree", "bfs", "queue"]),
          starterCode: JSON.stringify({ javascript: "function levelOrder(root) {\n  \n}", python: "def level_order(root):\n    pass" }),
          testCases: JSON.stringify([{ input: "levelOrder([3,9,20,null,null,15,7])", expected: "[[3],[9,20],[15,7]]" }]),
        },
      }),
      prisma.practiceProblem.create({
        data: {
          userId: bob.id, title: "Merge K Sorted Lists",
          difficulty: "HARD",
          description: "You are given an array of k linked-lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list.",
          tags: JSON.stringify(["heap", "linked-list", "divide-and-conquer"]),
          starterCode: JSON.stringify({ javascript: "function mergeKLists(lists) {\n  \n}", python: "def merge_k_lists(lists):\n    pass" }),
          testCases: JSON.stringify([{ input: "mergeKLists([[1,4,5],[1,3,4],[2,6]])", expected: "[1,1,2,3,4,4,5,6]" }]),
        },
      }),
    ]);

    // ─── 11. Practice Progress (5) ────────────────────────────────────────
    const progresses = await Promise.all([
      prisma.practiceProgress.create({
        data: { userId: alice.id, problemId: practiceProblems[0].id, status: "COMPLETED", code: "function reverseList(head) {\n  let prev = null;\n  let curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}", language: "javascript", timeSpentSeconds: 480 },
      }),
      prisma.practiceProgress.create({
        data: { userId: alice.id, problemId: practiceProblems[1].id, status: "COMPLETED", code: "function levelOrder(root) {\n  if (!root) return [];\n  const result = [];\n  const queue = [root];\n  while (queue.length) {\n    const level = [];\n    const size = queue.length;\n    for (let i = 0; i < size; i++) {\n      const node = queue.shift();\n      level.push(node.val);\n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n    result.push(level);\n  }\n  return result;\n}", language: "javascript", timeSpentSeconds: 900 },
      }),
      prisma.practiceProgress.create({
        data: { userId: bob.id, problemId: practiceProblems[2].id, status: "IN_PROGRESS", code: "function mergeKLists(lists) {\n  // TODO: implement min heap\n}", language: "javascript", timeSpentSeconds: 600 },
      }),
      prisma.practiceProgress.create({
        data: { userId: alice.id, bankProblemId: "bank-two-sum", status: "COMPLETED", code: "function twoSum(nums, target) { ... }", language: "javascript", timeSpentSeconds: 300 },
      }),
      prisma.practiceProgress.create({
        data: { userId: bob.id, bankProblemId: "bank-valid-parens", status: "IN_PROGRESS", code: "function isValid(s) { ... }", language: "javascript", timeSpentSeconds: 200 },
      }),
    ]);

    // ─── 12. Practice Submissions (4) ─────────────────────────────────────
    await prisma.practiceSubmission.createMany({
      data: [
        { userId: alice.id, progressId: progresses[0].id, problemId: practiceProblems[0].id, code: progresses[0].code!, language: "javascript", status: "ACCEPTED", testsPassed: 5, testsTotal: 5, timeSpentSeconds: 480 },
        { userId: alice.id, progressId: progresses[1].id, problemId: practiceProblems[1].id, code: progresses[1].code!, language: "javascript", status: "ACCEPTED", testsPassed: 8, testsTotal: 8, timeSpentSeconds: 900 },
        { userId: bob.id, progressId: progresses[2].id, problemId: practiceProblems[2].id, code: "function mergeKLists(lists) { return lists.flat().sort(); }", language: "javascript", status: "WRONG_ANSWER", testsPassed: 3, testsTotal: 10, timeSpentSeconds: 450 },
        { userId: alice.id, progressId: progresses[3].id, bankProblemId: "bank-two-sum", code: "function twoSum(nums, target) { ... }", language: "javascript", status: "ACCEPTED", testsPassed: 4, testsTotal: 4, timeSpentSeconds: 300 },
      ],
    });

    // ─── 13. Badges (seed definitions + award to candidates) ──────────────
    // Ensure badge definitions exist
    for (const badge of BADGE_DEFINITIONS) {
      await prisma.badge.upsert({
        where: { slug: badge.slug },
        update: {},
        create: {
          slug: badge.slug,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          category: badge.category,
          threshold: badge.threshold,
        },
      });
    }

    const badgeSlugs = ["fire-starter", "week-warrior", "first-blood", "ten-down", "speed-demon", "easy-ace"];
    const badges = await prisma.badge.findMany({
      where: { slug: { in: badgeSlugs } },
    });

    const userBadgeData: { userId: string; badgeId: string }[] = [];
    for (const badge of badges) {
      if (["fire-starter", "first-blood", "speed-demon", "easy-ace"].includes(badge.slug)) {
        userBadgeData.push({ userId: alice.id, badgeId: badge.id });
      }
      if (["fire-starter", "first-blood"].includes(badge.slug)) {
        userBadgeData.push({ userId: bob.id, badgeId: badge.id });
      }
    }
    if (userBadgeData.length > 0) {
      await prisma.userBadge.createMany({ data: userBadgeData, skipDuplicates: true });
    }

    // ─── 14. XP Transactions (10) ─────────────────────────────────────────
    const xpData = [
      { userId: alice.id, amount: 50, reason: "PROBLEM_SOLVED", sourceId: practiceProblems[0].id },
      { userId: alice.id, amount: 25, reason: "PROBLEM_SOLVED", sourceId: practiceProblems[1].id },
      { userId: alice.id, amount: 5, reason: "DAILY_LOGIN" },
      { userId: alice.id, amount: 50, reason: "STREAK_BONUS" },
      { userId: alice.id, amount: 50, reason: "DAILY_CHALLENGE" },
      { userId: alice.id, amount: 25, reason: "BADGE_EARNED" },
      { userId: bob.id, amount: 10, reason: "PROBLEM_SOLVED" },
      { userId: bob.id, amount: 5, reason: "DAILY_LOGIN" },
      { userId: bob.id, amount: 50, reason: "STREAK_BONUS" },
      { userId: carol.id, amount: 5, reason: "DAILY_LOGIN" },
    ];
    await prisma.xPTransaction.createMany({ data: xpData });

    // ─── 15. Daily Activity (last 30 days for heatmap) ────────────────────
    const dailyActivityData: { userId: string; date: string; problems: number; xpEarned: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      // Alice active most days
      if (i < 25) {
        dailyActivityData.push({ userId: alice.id, date: dateStr, problems: Math.floor(Math.random() * 4) + 1, xpEarned: Math.floor(Math.random() * 60) + 10 });
      }
      // Bob sporadic
      if (i % 3 === 0) {
        dailyActivityData.push({ userId: bob.id, date: dateStr, problems: Math.floor(Math.random() * 2) + 1, xpEarned: Math.floor(Math.random() * 30) + 5 });
      }
    }
    await prisma.dailyActivity.createMany({ data: dailyActivityData });

    // ─── 16. Daily Challenge (today) ──────────────────────────────────────
    const todayStr = now.toISOString().slice(0, 10);
    await prisma.dailyChallenge.upsert({
      where: { date: todayStr },
      update: {},
      create: { date: todayStr, problemId: practiceProblems[1].id, bonusXP: 50 },
    });

    // ─── 17. Chat Messages (6 in completed sessions) ──────────────────────
    await prisma.chatMessage.createMany({
      data: [
        { sessionId: completedSessions[0].id, senderId: interviewer.id, content: "Welcome! Please start by reading the problem carefully.", timestamp: new Date(completedSessions[0].startedAt!.getTime() + 1000) },
        { sessionId: completedSessions[0].id, senderId: alice.id, content: "Got it, I see we need to find two numbers that sum to the target.", timestamp: new Date(completedSessions[0].startedAt!.getTime() + 60000) },
        { sessionId: completedSessions[0].id, senderId: interviewer.id, content: "Good observation. What approach are you thinking?", timestamp: new Date(completedSessions[0].startedAt!.getTime() + 90000) },
        { sessionId: completedSessions[1].id, senderId: interviewer.id, content: "Take your time and think through the approach before coding.", timestamp: new Date(completedSessions[1].startedAt!.getTime() + 1000) },
        { sessionId: completedSessions[1].id, senderId: bob.id, content: "I think a dictionary/hash map would work here.", timestamp: new Date(completedSessions[1].startedAt!.getTime() + 120000) },
        { sessionId: completedSessions[2].id, senderId: interviewer.id, content: "Let's start with the high-level architecture.", timestamp: new Date(completedSessions[2].startedAt!.getTime() + 1000) },
      ],
    });

    // ─── 18. Session Logs (10) ────────────────────────────────────────────
    await prisma.sessionLog.createMany({
      data: [
        { sessionId: completedSessions[0].id, userId: alice.id, action: "JOIN", timestamp: completedSessions[0].startedAt! },
        { sessionId: completedSessions[0].id, userId: interviewer.id, action: "JOIN", timestamp: completedSessions[0].startedAt! },
        { sessionId: completedSessions[0].id, userId: alice.id, action: "CODE_CHANGE", details: "Started writing solution", timestamp: new Date(completedSessions[0].startedAt!.getTime() + 120000) },
        { sessionId: completedSessions[0].id, userId: alice.id, action: "AI_REQUEST", details: "Asked for hint on approach", timestamp: new Date(completedSessions[0].startedAt!.getTime() + 300000) },
        { sessionId: completedSessions[1].id, userId: bob.id, action: "JOIN", timestamp: completedSessions[1].startedAt! },
        { sessionId: completedSessions[1].id, userId: interviewer.id, action: "JOIN", timestamp: completedSessions[1].startedAt! },
        { sessionId: completedSessions[1].id, userId: bob.id, action: "CODE_CHANGE", details: "Initial approach", timestamp: new Date(completedSessions[1].startedAt!.getTime() + 180000) },
        { sessionId: completedSessions[1].id, userId: bob.id, action: "AI_REQUEST", details: "Asked for optimization help", timestamp: new Date(completedSessions[1].startedAt!.getTime() + 600000) },
        { sessionId: completedSessions[2].id, userId: alice.id, action: "JOIN", timestamp: completedSessions[2].startedAt! },
        { sessionId: activeSession.id, userId: carol.id, action: "JOIN", timestamp: activeSession.startedAt! },
      ],
    });

    // ─── 19. Violations (2) ───────────────────────────────────────────────
    await prisma.violation.createMany({
      data: [
        { sessionId: completedSessions[1].id, userId: bob.id, type: "TAB_SWITCH", details: "Switched to another tab for 8 seconds", timestamp: new Date(completedSessions[1].startedAt!.getTime() + 900000) },
        { sessionId: completedSessions[1].id, userId: bob.id, type: "TAB_SWITCH", details: "Switched to another tab for 3 seconds", timestamp: new Date(completedSessions[1].startedAt!.getTime() + 1500000) },
      ],
    });

    // ─── 20. Interviewer Notes (3) ────────────────────────────────────────
    await prisma.interviewerNote.createMany({
      data: [
        { sessionId: completedSessions[0].id, interviewerId: interviewer.id, content: "Candidate showed strong problem-solving skills. Good communication throughout.", timestamp: new Date(completedSessions[0].endedAt!.getTime() - 60000) },
        { sessionId: completedSessions[1].id, interviewerId: interviewer.id, content: "Needed significant AI help. Consider for a more junior role.", timestamp: new Date(completedSessions[1].endedAt!.getTime() - 60000) },
        { sessionId: completedSessions[2].id, interviewerId: interviewer.id, content: "Excellent system design knowledge. Strong hire recommendation.", timestamp: new Date(completedSessions[2].endedAt!.getTime() - 60000) },
      ],
    });

    // ─── 21. Code Snapshots (4) ───────────────────────────────────────────
    await prisma.codeSnapshot.createMany({
      data: [
        { sessionId: completedSessions[0].id, code: "// Initial attempt\nfunction twoSum(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i+1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) return [i, j];\n    }\n  }\n}", language: "javascript", questionIndex: 0, timestamp: new Date(completedSessions[0].startedAt!.getTime() + 300000) },
        { sessionId: completedSessions[0].id, code: completedSessions[0].code!, language: "javascript", questionIndex: 0, timestamp: new Date(completedSessions[0].startedAt!.getTime() + 1800000) },
        { sessionId: completedSessions[1].id, code: "def two_sum(nums, target):\n    # brute force first\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]", language: "python", questionIndex: 0, timestamp: new Date(completedSessions[1].startedAt!.getTime() + 300000) },
        { sessionId: completedSessions[1].id, code: completedSessions[1].code!, language: "python", questionIndex: 0, timestamp: new Date(completedSessions[1].startedAt!.getTime() + 1500000) },
      ],
    });

    // ─── 22. Notifications (6 — 2 per candidate) ─────────────────────────
    await prisma.notification.createMany({
      data: [
        { userId: alice.id, type: "SESSION_COMPLETED", title: "Interview Completed", message: "Your technical interview with Demo Corp has been completed. View your results.", link: `/dashboard/sessions/${completedSessions[0].id}` },
        { userId: alice.id, type: "PIPELINE_UPDATE", title: "Pipeline Update", message: "You've been moved to the TECHNICAL stage for Frontend Engineer at Demo Corp." },
        { userId: bob.id, type: "SESSION_COMPLETED", title: "Interview Completed", message: "Your technical interview has been completed. Audit report is available.", link: `/dashboard/sessions/${completedSessions[1].id}` },
        { userId: bob.id, type: "CANDIDATE_WAITING", title: "Interview Scheduled", message: "You have an upcoming interview scheduled for tomorrow." },
        { userId: carol.id, type: "REVIEW_PENDING", title: "Interview In Progress", message: "Your current interview session is active." },
        { userId: carol.id, type: "SYSTEM", title: "Welcome to printf", message: "Complete your profile to get started with practice problems." },
      ],
    });

    // ─── 23. Weakness Profile (for Alice) ─────────────────────────────────
    await prisma.weaknessProfile.create({
      data: {
        userId: alice.id,
        profile: JSON.stringify({
          weakTopics: ["dynamic-programming", "graph-algorithms"],
          strongTopics: ["arrays", "hash-maps", "linked-lists"],
          recommendedPractice: ["dp-coin-change", "dp-longest-subsequence", "graph-bfs"],
          lastAnalyzed: now.toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Demo data seeded successfully",
      counts: {
        company: 1,
        users: 5,
        templates: 3,
        sessions: 8,
        auditReports: 4,
        aiInteractions: 12,
        positions: 2,
        applications: 5,
        pipelines: 3,
        practiceProblems: 3,
        practiceProgress: 5,
        submissions: 4,
        badges: BADGE_DEFINITIONS.length,
        userBadges: userBadgeData.length,
        xpTransactions: 10,
        dailyActivity: dailyActivityData.length,
        dailyChallenges: 1,
        chatMessages: 6,
        sessionLogs: 10,
        violations: 2,
        interviewerNotes: 3,
        codeSnapshots: 4,
        notifications: 6,
        weaknessProfiles: 1,
      },
    });
  } catch (error) {
    console.error("POST /api/test-mode/seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed demo data", details: String(error) },
      { status: 500 }
    );
  }
}
