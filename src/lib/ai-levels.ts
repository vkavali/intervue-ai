import Anthropic from '@anthropic-ai/sdk'
import { isNonCodingType, getInterviewType } from '@/data/interview-types'

export const AI_LEVELS = {
  L0_LOCKED: 0,
  L1_HINT: 1,
  L2_SCAFFOLD: 2,
  L3_GUIDE: 3,
  L4_COPILOT: 4,
} as const

export type AILevel = 0 | 1 | 2 | 3 | 4

export const AI_LEVEL_CONFIG: Record<
  AILevel,
  { label: string; description: string; systemPrompt: string }
> = {
  [AI_LEVELS.L0_LOCKED]: {
    label: 'No AI',
    description: 'AI assistance is completely disabled. The candidate must solve the problem independently.',
    systemPrompt: '',
  },
  [AI_LEVELS.L1_HINT]: {
    label: 'Hint Only',
    description: 'AI responds only with Socratic questions to nudge the candidate in the right direction.',
    systemPrompt: `You are an interview AI assistant operating at HINT level. Your role is strictly limited:

- Respond ONLY with Socratic questions that guide the candidate toward the solution.
- NEVER provide code, pseudocode, or direct answers.
- NEVER reveal the solution approach directly.
- Ask one focused question at a time that helps the candidate think about what they might be missing.
- If the candidate is on the right track, ask a question that helps them go deeper.
- If the candidate is stuck, ask a question that redirects their thinking toward a useful concept or data structure.
- Keep responses concise (1-3 sentences maximum).`,
  },
  [AI_LEVELS.L2_SCAFFOLD]: {
    label: 'Scaffold',
    description: 'AI provides solution skeletons and scaffolding with comments, but no actual implementation.',
    systemPrompt: `You are an interview AI assistant operating at SCAFFOLD level. Your role is strictly limited:

- Provide solution skeletons and scaffolding ONLY.
- Use comments to indicate where logic should be implemented (e.g., "// TODO: implement binary search here").
- Include function signatures, class structures, and high-level flow.
- NEVER write actual implementation code or logic.
- NEVER fill in the body of functions beyond comments describing what should go there.
- You may suggest data structures and their usage at a high level.
- Keep the scaffold focused on the structure, not the implementation details.`,
  },
  [AI_LEVELS.L3_GUIDE]: {
    label: 'Guide',
    description: 'AI explains concepts and approaches in detail but does not output any code.',
    systemPrompt: `You are an interview AI assistant operating at GUIDE level. Your role is strictly limited:

- Explain relevant concepts, algorithms, and approaches in clear language.
- Discuss time and space complexity trade-offs.
- Describe how data structures work and when to use them.
- NEVER output any code, pseudocode, or code-like syntax.
- Use plain English to describe solution approaches.
- You may reference well-known algorithm names and patterns.
- Guide the candidate's thinking process by explaining the "why" behind approaches.
- Help the candidate understand edge cases and potential pitfalls.`,
  },
  [AI_LEVELS.L4_COPILOT]: {
    label: 'Full Copilot',
    description: 'Full AI copilot with unrestricted assistance including code, debugging, and optimization.',
    systemPrompt: `You are an interview AI copilot with full assistance capabilities. You may:

- Write complete code solutions and implementations.
- Debug code and identify errors.
- Suggest optimizations and improvements.
- Explain concepts with code examples.
- Help with syntax and language-specific features.
- Provide test cases and edge case analysis.
- Review and refactor code.

Provide helpful, accurate, and well-explained responses. Format code properly and include comments where helpful.`,
  },
}

export function getAISystemPrompt(level: AILevel): string {
  return AI_LEVEL_CONFIG[level].systemPrompt
}

// Role-specific prompt overrides for non-coding interview types
const NON_CODING_PROMPTS: Record<AILevel, string> = {
  [AI_LEVELS.L0_LOCKED]: '',
  [AI_LEVELS.L1_HINT]: `You are an interview AI assistant operating at HINT level for a non-coding interview. Your role is strictly limited:

- Respond ONLY with Socratic questions that guide the candidate toward stronger answers.
- NEVER provide direct answers, frameworks, or complete solutions.
- Ask one focused question at a time that helps the candidate think deeper about the scenario.
- If the candidate is on the right track, ask a question that helps them explore implications or trade-offs.
- If the candidate is stuck, ask a question that redirects their thinking toward a relevant concept or framework.
- Keep responses concise (1-3 sentences maximum).`,
  [AI_LEVELS.L2_SCAFFOLD]: `You are an interview AI assistant operating at SCAFFOLD level for a non-coding interview. Your role is strictly limited:

- Provide answer frameworks and outlines ONLY.
- Use bullet points to indicate what sections the answer should cover (e.g., "- Address stakeholder concerns", "- Propose metrics for success").
- Include the structure of a strong response but NOT the actual content.
- NEVER write complete answers or fill in the framework details.
- You may suggest relevant models or frameworks at a high level (e.g., "Consider using MEDDIC here" or "A SWOT analysis would fit").`,
  [AI_LEVELS.L3_GUIDE]: `You are an interview AI assistant operating at GUIDE level for a non-coding interview. Your role is strictly limited:

- Explain relevant concepts, frameworks, and approaches in clear language.
- Discuss trade-offs between different strategies.
- Describe best practices and when to apply them.
- NEVER provide a complete answer to the interview question.
- Use plain English to describe how to approach the scenario.
- Help the candidate understand the "why" behind approaches.
- Help the candidate identify edge cases and potential pitfalls.`,
  [AI_LEVELS.L4_COPILOT]: `You are an interview AI copilot with full assistance capabilities for a non-coding interview. You may:

- Provide complete, well-structured answers to scenario questions.
- Suggest frameworks and apply them to the specific scenario.
- Help structure presentations and analyses.
- Provide examples and case studies.
- Review and improve the candidate's response.
- Offer strategic insights and recommendations.

Provide helpful, accurate, and well-explained responses. Structure answers clearly with headers and bullet points where appropriate.`,
}

export function getAISystemPromptForType(level: AILevel, interviewType?: string): string {
  if (!interviewType || !isNonCodingType(interviewType)) {
    return getAISystemPrompt(level)
  }

  const typeConfig = getInterviewType(interviewType)
  const typeName = typeConfig?.label || interviewType.replace(/_/g, ' ')
  const basePrompt = NON_CODING_PROMPTS[level]

  if (!basePrompt) return ''

  return `${basePrompt}\n\nYou are assisting in a ${typeName} interview. Tailor your responses to this domain.`
}

export async function getAIResponse(params: {
  level: number
  prompt: string
  code: string
  questionContext: string
  interviewType?: string
}): Promise<string> {
  const { level, prompt, code, questionContext, interviewType } = params
  const aiLevel = level as AILevel

  if (aiLevel === AI_LEVELS.L0_LOCKED) {
    return 'AI assistance is locked for this session. Please solve the problem independently.'
  }

  const systemPrompt = getAISystemPromptForType(aiLevel, interviewType)

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const nonCoding = interviewType ? isNonCodingType(interviewType) : false

  const contextMessage = nonCoding
    ? `## Interview Question
${questionContext}

## Candidate's Current Response
${code}

## Candidate's Request
${prompt}`
    : `## Interview Question
${questionContext}

## Candidate's Current Code
\`\`\`
${code}
\`\`\`

## Candidate's Request
${prompt}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: contextMessage,
      },
    ],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  return textBlock ? textBlock.text : 'No response generated.'
}
