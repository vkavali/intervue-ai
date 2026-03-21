import Anthropic from '@anthropic-ai/sdk'
import { getScoringDimensions, isNonCodingType } from '@/data/interview-types'

interface AuditInput {
  session: {
    id: string
    status: string
    aiLevel: number
    startedAt: Date | null
    endedAt: Date | null
    code: string | null
    language: string | null
    candidate: { id: string; name: string; email: string }
  }
  questions: {
    title: string
    description: string
    difficulty: string
    constraints: string | null
    examples: string | null
  }[]
  aiInteractions: {
    prompt: string
    response: string
    aiLevel: number
    timestamp: Date
  }[]
  aiLevelOverrides: {
    previousLevel: number
    newLevel: number
    reason: string
    timestamp: Date
  }[]
  interviewerNotes: {
    content: string
    timestamp: Date
  }[]
  code: string
  language: string
  interviewType?: string
}

interface AuditAnalysis {
  overallScore: number
  problemComprehension: number
  solutionCorrectness: number
  codeQuality: number
  communication: number
  aiUsageQuality: number
  timeManagement: number
  thinkingTrace: string
  riskFlags: string[]
  quoteHighlights: string[]
  suggestedDecision: 'HIRE' | 'NO_HIRE' | 'FURTHER_ROUND'
  confidence: number
  reasoning: string
}

export async function generateAuditReport(input: AuditInput): Promise<AuditAnalysis> {
  const { session, questions, aiInteractions, aiLevelOverrides, code, language, interviewType } = input

  const type = interviewType || 'TECHNICAL'
  const nonCoding = isNonCodingType(type)
  const dimensions = getScoringDimensions(type)

  const questionsText = questions
    .map((q, i) => `Q${i + 1}: ${q.title}\nDescription: ${q.description}\nDifficulty: ${q.difficulty}\nConstraints: ${q.constraints || 'N/A'}\nExamples: ${q.examples || 'N/A'}`)
    .join('\n\n')

  const transcript = aiInteractions
    .map((interaction) =>
      `[${interaction.timestamp.toISOString ? interaction.timestamp.toISOString() : interaction.timestamp}] [Level ${interaction.aiLevel}]\nCandidate: ${interaction.prompt}\nAI: ${interaction.response}`
    )
    .join('\n\n---\n\n')

  const overridesText = aiLevelOverrides
    .map((o) => `[${o.timestamp}] Level ${o.previousLevel} -> ${o.newLevel} (Reason: ${o.reason})`)
    .join('\n')

  const durationMin = session.startedAt && session.endedAt
    ? Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
    : 'Unknown'

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const responseSection = nonCoding
    ? `## Candidate's Response\n${code || 'No response submitted'}`
    : `## Candidate's Final Code (${language})\n\`\`\`${language}\n${code || 'No code submitted'}\n\`\`\``

  const auditorRole = nonCoding
    ? `You are an expert ${type.toLowerCase().replace(/_/g, ' ')} interview auditor for Intervue.AI.`
    : 'You are an expert technical interview auditor for Intervue.AI.'

  const auditPrompt = `${auditorRole} Analyze the following interview session and generate a comprehensive audit report.

## Interview Type: ${type.replace(/_/g, ' ')}

## Interview Questions
${questionsText}

${responseSection}

## AI Interaction Transcript
${transcript || 'No AI interactions recorded'}

## AI Level Overrides
${overridesText || 'No overrides during session'}

## Session Metadata
- Candidate: ${session.candidate.name} (${session.candidate.email})
- AI Assist Level: ${session.aiLevel}
- Duration: ${durationMin} minutes
- Total AI interactions: ${aiInteractions.length}
- Status: ${session.status}

## Instructions
Analyze the complete session and provide your assessment as a JSON object with EXACTLY these fields:

{
  "overallScore": <number 0-100>,
  "problemComprehension": <number 0-10, evaluate: ${dimensions.problemComprehension}>,
  "solutionCorrectness": <number 0-10, evaluate: ${dimensions.solutionCorrectness}>,
  "codeQuality": <number 0-10, evaluate: ${dimensions.codeQuality}>,
  "communication": <number 0-10, evaluate: ${dimensions.communication}>,
  "aiUsageQuality": <number 0-10, evaluate: ${dimensions.aiUsageQuality}>,
  "timeManagement": <number 0-10, evaluate: ${dimensions.timeManagement}>,
  "thinkingTrace": "<narrative of how the candidate approached the ${nonCoding ? 'scenario' : 'problem'}>",
  "riskFlags": ["<array of concern strings>"],
  "quoteHighlights": ["<array of notable candidate quotes>"],
  "suggestedDecision": "<HIRE | NO_HIRE | FURTHER_ROUND>",
  "confidence": <number 0-100>,
  "reasoning": "<detailed explanation>"
}

Scoring guidelines:
- ${dimensions.aiUsageQuality}: High for candidates who use AI as a thinking partner with targeted questions. Low for blind copy-paste or over-reliance.
- If AI level was L0, score aiUsageQuality as 5 (N/A).
- riskFlags: Flag patterns like ${nonCoding ? 'superficial answers, lack of structure, vague responses, no follow-up questions' : 'copying without understanding, no clarifying questions, over-reliance on AI'}.
- quoteHighlights: Pick 3-5 representative moments.

Respond with ONLY the JSON object.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: auditPrompt }],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Failed to generate audit analysis')
  }

  let jsonText = textBlock.text.trim()
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  const analysis: AuditAnalysis = JSON.parse(jsonText)

  const validDecisions = ['HIRE', 'NO_HIRE', 'FURTHER_ROUND'] as const
  if (!validDecisions.includes(analysis.suggestedDecision)) {
    analysis.suggestedDecision = 'FURTHER_ROUND'
  }

  return analysis
}
