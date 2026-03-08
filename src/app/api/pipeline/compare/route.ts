import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

// POST /api/pipeline/compare - Generate AI comparison between candidates for a role
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json(
        { error: 'Only company admins can generate candidate comparisons' },
        { status: 403 }
      )
    }

    if (!user.companyId) {
      return NextResponse.json(
        { error: 'User not associated with a company' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { role, seniority } = body

    if (!role) {
      return NextResponse.json(
        { error: 'Missing required field: role' },
        { status: 400 }
      )
    }

    // Find all pipeline entries for this role at this company
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipelineWhere: any = {
      companyId: user.companyId,
      role,
    }
    if (seniority) {
      pipelineWhere.seniority = seniority
    }

    const pipelineEntries = await prisma.candidatePipeline.findMany({
      where: pipelineWhere,
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            candidateSessions: {
              where: {
                companyId: user.companyId,
                status: 'COMPLETED',
              },
              include: {
                template: {
                  select: { title: true, role: true, roundType: true, seniority: true },
                },
                auditReport: true,
                aiInteractions: {
                  orderBy: { timestamp: 'asc' },
                },
                interviewerNotes: {
                  orderBy: { timestamp: 'asc' },
                  include: {
                    interviewer: { select: { name: true } },
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    })

    if (pipelineEntries.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 candidates in the pipeline are required for comparison' },
        { status: 400 }
      )
    }

    // Build detailed candidate data summaries for the AI prompt
    const candidateDataText = pipelineEntries
      .map((entry, idx) => {
        const candidate = entry.candidate
        const sessions = candidate.candidateSessions

        const roundsText = sessions
          .map((s, rIdx) => {
            const audit = s.auditReport
            const notesText = s.interviewerNotes
              .map((n) => `    [${n.interviewer.name}]: ${n.content}`)
              .join('\n')

            const aiInteractionSummary =
              s.aiInteractions.length > 0
                ? `Total AI interactions: ${s.aiInteractions.length}. ` +
                  `Sample prompts: ${s.aiInteractions
                    .slice(0, 3)
                    .map((ai) => `"${ai.prompt.substring(0, 100)}"`)
                    .join(', ')}`
                : 'No AI interactions during this round.'

            const auditText = audit
              ? `    Overall Score: ${audit.overallScore}/100
    Problem Comprehension: ${audit.problemComprehension}/10
    Solution Correctness: ${audit.solutionCorrectness}/10
    Code Quality: ${audit.codeQuality}/10
    Communication: ${audit.communication}/10
    AI Usage Quality: ${audit.aiUsageQuality}/10
    Time Management: ${audit.timeManagement}/10
    Suggested Decision: ${audit.suggestedDecision} (Confidence: ${audit.confidence}%)
    Reasoning: ${audit.reasoning}
    Thinking Trace: ${audit.thinkingTrace}
    Risk Flags: ${audit.riskFlags}
    Quote Highlights: ${audit.quoteHighlights}`
              : '    No audit report available for this round.'

            return `  Round ${rIdx + 1}: ${s.template.roundType} - ${s.template.title} (Seniority: ${s.template.seniority})
    Audit Scores:
${auditText}
    Interviewer Notes:
${notesText || '    No interviewer notes.'}
    AI Interaction: ${aiInteractionSummary}`
          })
          .join('\n\n')

        return `
===================================================================
CANDIDATE ${idx + 1}: ${candidate.name} (${candidate.email})
ID: ${candidate.id}
Pipeline Stage: ${entry.stage}
Pipeline Notes: ${entry.notes || 'No pipeline notes.'}
Completed Rounds: ${sessions.length}
===================================================================
${roundsText || '  No completed interview rounds on record.'}`
      })
      .join('\n')

    const seniorityText = seniority ? ` at the ${seniority} level` : ''

    const comparisonPrompt = `You are a senior hiring manager making a final decision. You've reviewed all interview rounds for these candidates applying for the "${role}" role${seniorityText}. Think like a human, not a scoring machine. Consider:
- Who showed genuine problem-solving ability vs just memorized patterns?
- Who communicated their thinking clearly and asked good clarifying questions?
- Who showed growth during the interview vs stayed flat?
- Who would you actually want on your team and why?
- What are the trade-offs between candidates?
- Are there any red flags that scores alone don't capture?

Be honest, nuanced, and specific. Don't just compare numbers. Tell me WHO you'd hire and WHY, like you're talking to the CEO.

## Candidate Data

${candidateDataText}

## Response Format

Respond with ONLY a valid JSON object in exactly this format:

{
  "candidates": [
    {
      "candidateId": "string - the candidate's actual ID from above",
      "candidateName": "string - the candidate's name",
      "roundsSummary": [
        {
          "round": "string - round name",
          "score": <number - overall score for this round>,
          "highlights": "string - what stood out positively",
          "concerns": "string - what concerned you"
        }
      ],
      "overallImpression": "string - your gut feeling about this candidate as a human, not a number",
      "standoutQualities": ["string - 2-4 things that make this candidate special"],
      "concerns": ["string - 1-3 honest concerns"],
      "growthDuringInterview": "string - did they get better or worse as the interview progressed?",
      "teamFitAssessment": "string - would they work well on a team? why or why not?",
      "rank": <number - 1 is best>
    }
  ],
  "recommendation": {
    "selectedCandidate": "string - name of the recommended candidate",
    "selectedCandidateId": "string - ID of the recommended candidate",
    "reasoning": "string - detailed, human-like explanation of why you'd hire this person",
    "confidence": "high" | "medium" | "low",
    "alternateConsideration": "string - who else came close and why",
    "tradeoffs": "string - what you gain and lose with this choice"
  },
  "overallObservations": "string - patterns across all candidates",
  "interviewProcessFeedback": "string - suggestions for improving the interview process"
}`

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: comparisonPrompt }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Failed to generate comparison analysis')
    }

    let jsonText = textBlock.text.trim()
    // Strip markdown code fences if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const analysis = JSON.parse(jsonText)

    // Save the comparison to the database
    const effectiveSeniority = seniority || pipelineEntries[0]?.seniority || 'UNSPECIFIED'

    const hiringComparison = await prisma.hiringComparison.create({
      data: {
        companyId: user.companyId,
        role,
        seniority: effectiveSeniority,
        analysis: JSON.stringify(analysis),
        recommendation: JSON.stringify(analysis.recommendation),
      },
    })

    return NextResponse.json(
      {
        id: hiringComparison.id,
        role,
        seniority: effectiveSeniority,
        candidatesCompared: pipelineEntries.length,
        analysis,
        createdAt: hiringComparison.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/pipeline/compare error:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI comparison response. Please try again.' },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
