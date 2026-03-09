import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PROBLEM_BANK } from '@/data/problem-bank'
import { checkUserRateLimit } from '@/lib/rate-limiter'
import Anthropic from '@anthropic-ai/sdk'

// POST /api/practice/enrich - AI-enrich a bank problem (available to all authenticated users)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Rate limit check
    const plan = user.company?.plan || null
    const rateCheck = checkUserRateLimit(user.id, 'enrichment', plan)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded for problem enrichment',
          remaining: rateCheck.remaining,
          limit: rateCheck.limit,
          resetIn: rateCheck.resetIn,
        },
        { status: 429 }
      )
    }

    const { bankProblemId } = await req.json()

    if (!bankProblemId) {
      return NextResponse.json(
        { error: 'bankProblemId is required' },
        { status: 400 }
      )
    }

    // Find the problem in the bank
    const problem = PROBLEM_BANK.find((p) => p.id === bankProblemId)
    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found in bank' },
        { status: 404 }
      )
    }

    // Check for existing enrichment in DB
    const existing = await prisma.enrichedBankProblem.findUnique({
      where: { bankProblemId },
    })

    if (existing) {
      return NextResponse.json({
        ...problem,
        constraints: existing.constraints || problem.constraints,
        examples: existing.examples || problem.examples,
        starterCode: existing.starterCode
          ? JSON.parse(existing.starterCode)
          : problem.starterCode,
        testCases: existing.testCases ? JSON.parse(existing.testCases) : null,
        enriched: true,
        cached: true,
      })
    }

    // Generate enrichment via Claude API
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const enrichPrompt = `You are enriching a coding interview problem for a practice platform. Given the problem below, generate:
1. Detailed constraints with specific bounds
2. Clear examples with input/output (2-3 examples)
3. Starter code templates in JavaScript, TypeScript, and Python
4. 8-12 test cases covering normal, edge, and boundary cases

## Problem
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Category: ${problem.category}
Tags: ${problem.tags.join(', ')}
Description: ${problem.description}
${problem.constraints ? `Existing Constraints: ${problem.constraints}` : ''}
${problem.examples ? `Existing Examples: ${problem.examples}` : ''}

Respond with ONLY a JSON object (no markdown fences):
{
  "constraints": "<detailed constraints, e.g. '1 <= n <= 10^5\\n-10^9 <= nums[i] <= 10^9'>",
  "examples": "<formatted examples with Input/Output pairs>",
  "starterCode": {
    "javascript": "<function stub with JSDoc and test calls>",
    "typescript": "<typed function stub with test calls>",
    "python": "<function stub with docstring and test calls>"
  },
  "testCases": [
    { "input": "functionName(arg1, arg2)", "expected": "expectedResult" }
  ]
}

Requirements:
- Use descriptive function names matching the problem (camelCase for JS/TS, snake_case for Python)
- Include console.log/print test calls in starter code
- Provide 8-12 test cases covering: basic cases, edge cases (empty input, single element), large values, boundary conditions
- Test case inputs should be valid JavaScript expressions that can be evaluated
- Do NOT wrap response in markdown code fences`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: enrichPrompt }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Failed to generate enrichment')
    }

    let jsonText = textBlock.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const enrichment = JSON.parse(jsonText)

    // Persist to DB for caching
    await prisma.enrichedBankProblem.create({
      data: {
        bankProblemId,
        constraints: enrichment.constraints || problem.constraints || null,
        examples: enrichment.examples || problem.examples || null,
        starterCode: enrichment.starterCode
          ? JSON.stringify(enrichment.starterCode)
          : null,
        testCases: enrichment.testCases
          ? JSON.stringify(enrichment.testCases)
          : null,
      },
    })

    return NextResponse.json({
      ...problem,
      constraints: enrichment.constraints || problem.constraints,
      examples: enrichment.examples || problem.examples,
      starterCode: enrichment.starterCode || problem.starterCode,
      testCases: enrichment.testCases || null,
      enriched: true,
    })
  } catch (error) {
    console.error('POST /api/practice/enrich error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
