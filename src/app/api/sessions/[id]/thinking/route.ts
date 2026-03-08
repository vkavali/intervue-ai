import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

interface ThinkingPattern {
  pattern: string
  evidence: string
  strength: 'positive' | 'neutral' | 'concerning'
}

interface ThinkingAnalysis {
  overallApproach: string
  thinkingPatterns: ThinkingPattern[]
  problemSolvingStage: string
  strengths: string[]
  concerns: string[]
  aiUsagePattern: string
  suggestedFollowUp: string[]
  confidenceLevel: 'high' | 'medium' | 'low'
}

const NOT_ENOUGH_DATA_RESPONSE: ThinkingAnalysis = {
  overallApproach: 'Not enough data to analyze. The candidate has not made any AI interactions yet.',
  thinkingPatterns: [],
  problemSolvingStage: 'unknown',
  strengths: [],
  concerns: [],
  aiUsagePattern: 'No AI interactions recorded yet.',
  suggestedFollowUp: [
    'Ask the candidate to walk you through their initial approach.',
    'Ask what they are considering before they start coding.',
  ],
  confidenceLevel: 'low',
}

// In-memory cache for thinking analyses keyed by session ID
const analysisCache = new Map<string, { analysis: ThinkingAnalysis; timestamp: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// GET /api/sessions/[id]/thinking - Returns cached analysis if exists, or generates a new one
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Only interviewers and company admins can access thinking analysis
    if (user.role !== 'INTERVIEWER' && user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json(
        { error: 'Only interviewers and company admins can access thinking analysis' },
        { status: 403 }
      )
    }

    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: params.id },
      include: {
        template: {
          include: { questions: { orderBy: { orderIndex: 'asc' } } },
        },
        aiInteractions: { orderBy: { timestamp: 'asc' } },
      },
    })

    if (!interviewSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Verify access: must be the session's interviewer or a company admin in the same company
    const hasAccess =
      (user.role === 'COMPANY_ADMIN' &&
        user.companyId === interviewSession.companyId) ||
      interviewSession.interviewerId === user.id

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to this session' },
        { status: 403 }
      )
    }

    // Return not-enough-data response if no interactions
    if (interviewSession.aiInteractions.length === 0) {
      return NextResponse.json(NOT_ENOUGH_DATA_RESPONSE)
    }

    // Check cache
    const cached = analysisCache.get(params.id)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.analysis)
    }

    // Generate fresh analysis
    const analysis = await generateThinkingAnalysis(interviewSession)

    // Cache the result
    analysisCache.set(params.id, { analysis, timestamp: Date.now() })

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('GET /api/sessions/[id]/thinking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/sessions/[id]/thinking - Generates fresh analysis (bypasses cache)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Only interviewers and company admins can access thinking analysis
    if (user.role !== 'INTERVIEWER' && user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json(
        { error: 'Only interviewers and company admins can generate thinking analysis' },
        { status: 403 }
      )
    }

    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: params.id },
      include: {
        template: {
          include: { questions: { orderBy: { orderIndex: 'asc' } } },
        },
        aiInteractions: { orderBy: { timestamp: 'asc' } },
      },
    })

    if (!interviewSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Verify access
    const hasAccess =
      (user.role === 'COMPANY_ADMIN' &&
        user.companyId === interviewSession.companyId) ||
      interviewSession.interviewerId === user.id

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to this session' },
        { status: 403 }
      )
    }

    // Return not-enough-data response if no interactions
    if (interviewSession.aiInteractions.length === 0) {
      return NextResponse.json(NOT_ENOUGH_DATA_RESPONSE)
    }

    // Generate fresh analysis
    const analysis = await generateThinkingAnalysis(interviewSession)

    // Update cache
    analysisCache.set(params.id, { analysis, timestamp: Date.now() })

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('POST /api/sessions/[id]/thinking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ─── Helper ─────────────────────────────────────────────────────────────────────

interface SessionWithRelations {
  id: string
  code: string | null
  language: string | null
  aiLevel: number
  currentQuestionIndex: number
  template: {
    title: string
    role: string
    seniority: string
    questions: {
      title: string
      description: string
      difficulty: string
      constraints: string | null
      examples: string | null
      orderIndex: number
    }[]
  }
  aiInteractions: {
    prompt: string
    response: string
    aiLevel: number
    timestamp: Date
  }[]
}

async function generateThinkingAnalysis(
  interviewSession: SessionWithRelations
): Promise<ThinkingAnalysis> {
  const { template, aiInteractions, code, language } = interviewSession

  // Build question context
  const questionsText = template.questions
    .map(
      (q, i) =>
        `Q${i + 1}: ${q.title}\nDescription: ${q.description}\nDifficulty: ${q.difficulty}\nConstraints: ${q.constraints || 'N/A'}\nExamples: ${q.examples || 'N/A'}`
    )
    .join('\n\n')

  // Build AI interaction transcript
  const transcript = aiInteractions
    .map(
      (interaction, i) =>
        `[Interaction ${i + 1}] [AI Level ${interaction.aiLevel}] [${interaction.timestamp.toISOString ? interaction.timestamp.toISOString() : interaction.timestamp}]\nCandidate asked: ${interaction.prompt}\nAI responded: ${interaction.response}`
    )
    .join('\n\n---\n\n')

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const analysisPrompt = `You are an expert interview analyst for Intervue.AI. Your job is to analyze a candidate's thinking process during a live coding interview by examining their AI interactions, code, and the problem context.

## Interview Context
- Role: ${template.role}
- Seniority: ${template.seniority}
- Interview: ${template.title}

## Interview Questions
${questionsText}

## Candidate's Current Code (${language || 'unknown'})
\`\`\`${language || ''}
${code || 'No code written yet'}
\`\`\`

## AI Interaction Transcript (${aiInteractions.length} interactions)
${transcript}

## Analysis Instructions

Analyze the candidate's thinking process based on their AI interactions. Consider:

1. **What they ask** - Their prompts reveal what they understand, what confuses them, and how they decompose problems.
2. **The sequence** - The order of their questions shows their problem-solving approach (do they plan first? jump to coding? debug iteratively?).
3. **How they use responses** - Do they build on AI responses, or keep asking similar questions?
4. **Their code vs their questions** - Does their code reflect understanding of the AI responses?

Respond with ONLY a JSON object with exactly these fields:

{
  "overallApproach": "<summary of how the candidate is approaching the problem - 2-3 sentences>",
  "thinkingPatterns": [
    {
      "pattern": "<e.g., 'Top-down decomposition', 'Trial and error', 'Incremental building', 'Copy-paste without understanding'>",
      "evidence": "<specific quotes or behaviors from the transcript that demonstrate this pattern>",
      "strength": "<'positive' | 'neutral' | 'concerning'>"
    }
  ],
  "problemSolvingStage": "<where they currently are: 'understanding', 'planning', 'implementing', 'debugging', or 'optimizing'>",
  "strengths": ["<observed strengths based on their interactions>"],
  "concerns": ["<concerns or red flags, empty array if none>"],
  "aiUsagePattern": "<how they're using AI: 'independently', 'over-reliant', 'strategic', or 'avoiding'>",
  "suggestedFollowUp": ["<follow-up questions the interviewer could ask to probe the candidate's understanding>"],
  "confidenceLevel": "<'high' | 'medium' | 'low' - how confident you are in this analysis based on available data>"
}

Guidelines:
- Be objective and evidence-based. Cite specific interactions when possible.
- "thinkingPatterns" should have 2-5 entries.
- "strengths" and "concerns" should each have 1-4 entries.
- "suggestedFollowUp" should have 2-4 targeted questions.
- If there are very few interactions, set confidenceLevel to "low".
- Consider the seniority level when evaluating - expectations differ for junior vs senior candidates.

Respond with ONLY the JSON object, no markdown fences.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: analysisPrompt }],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Failed to generate thinking analysis')
  }

  let jsonText = textBlock.text.trim()
  // Strip markdown code fences if present
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  const analysis: ThinkingAnalysis = JSON.parse(jsonText)

  // Validate and normalize the response
  const validStrengths = ['positive', 'neutral', 'concerning'] as const
  analysis.thinkingPatterns = (analysis.thinkingPatterns || []).map((p) => ({
    ...p,
    strength: validStrengths.includes(p.strength) ? p.strength : 'neutral',
  }))

  const validConfidence = ['high', 'medium', 'low'] as const
  if (!validConfidence.includes(analysis.confidenceLevel)) {
    analysis.confidenceLevel = 'medium'
  }

  const validStages = ['understanding', 'planning', 'implementing', 'debugging', 'optimizing']
  if (!validStages.includes(analysis.problemSolvingStage)) {
    analysis.problemSolvingStage = 'implementing'
  }

  analysis.strengths = analysis.strengths || []
  analysis.concerns = analysis.concerns || []
  analysis.suggestedFollowUp = analysis.suggestedFollowUp || []

  return analysis
}
