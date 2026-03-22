import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PROBLEM_BANK } from '@/data/problem-bank'
import Anthropic from '@anthropic-ai/sdk'

// POST /api/problems/bank/enrich - AI-enrich a bank problem with constraints, starter code, test cases
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user || (user.role !== 'COMPANY_ADMIN' && user.role !== 'INTERVIEWER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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

    // Check for existing enrichment
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
      })
    }

    // Generate enrichment via Claude API
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const enrichPrompt = `You are enriching a coding interview problem for printf. Given the problem below, generate:
1. Detailed constraints (if not already provided)
2. Clear examples with input/output (if not already provided)
3. Starter code templates in JavaScript, Python, and Java
4. Test cases in a structured format

## Problem
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Category: ${problem.category}
Tags: ${problem.tags.join(', ')}
Description: ${problem.description}
${problem.constraints ? `Existing Constraints: ${problem.constraints}` : ''}
${problem.examples ? `Existing Examples: ${problem.examples}` : ''}

Respond with ONLY a JSON object:
{
  "constraints": "<detailed constraints string, e.g. '1 <= n <= 10^5\\n-10^9 <= nums[i] <= 10^9'>",
  "examples": "<formatted examples string with Input/Output pairs>",
  "starterCode": {
    "javascript": "function solveProblem(params) {\\n  // Your code here\\n}",
    "python": "def solve_problem(params):\\n    # Your code here\\n    pass",
    "java": "class Solution {\\n    public ReturnType solveProblem(ParamType params) {\\n        // Your code here\\n    }\\n}"
  },
  "testCases": [
    { "input": "functionName(arg1, arg2)", "expected": "expectedResult" },
    { "input": "functionName(arg1, arg2)", "expected": "expectedResult" }
  ]
}

Use descriptive function names matching the problem. Provide 3-5 test cases covering normal cases, edge cases, and boundary conditions. Do NOT wrap in markdown fences.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
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

    // Persist to DB
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
    console.error('POST /api/problems/bank/enrich error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
