import { callClaudeJSON } from "./ai-client";

export interface MockPackQuestion {
  question: string;
  whatTheyTest: string;
  strongAnswerShape: string;
  followUp: string;
}

export interface MockPackOutput {
  title: string;
  positioning: string;
  openingPitch: string;
  storiesToPrepare: string[];
  questions: MockPackQuestion[];
  scorecardSignals: string[];
  redFlags: string[];
  prepChecklist: string[];
  closingPitch: string;
}

const SYSTEM_PROMPT = `You are an expert interview coach creating a role-specific mock interview prep pack.

Respond with ONLY a JSON object:
{
  "title": "short pack title",
  "positioning": "2-3 sentence summary of what the candidate must signal",
  "openingPitch": "45-60 second first-person opener",
  "storiesToPrepare": ["story prompt", "story prompt", "story prompt", "story prompt"],
  "questions": [
    {
      "question": "interview question",
      "whatTheyTest": "what the interviewer is testing",
      "strongAnswerShape": "how to structure a strong answer",
      "followUp": "likely follow-up question"
    }
  ],
  "scorecardSignals": ["signal", "signal", "signal", "signal", "signal"],
  "redFlags": ["red flag", "red flag", "red flag", "red flag"],
  "prepChecklist": ["checklist item", "checklist item", "checklist item", "checklist item", "checklist item", "checklist item"],
  "closingPitch": "1-2 sentence closing answer for why this role/company fit makes sense"
}

Rules:
- Questions must match the role, seniority, and interview type.
- For non-coding interview types, generate scenario, strategy, analytical, and communication questions instead of code questions.
- Strong answer shapes should be concrete and actionable, not vague advice.
- Stories to prepare should push the candidate toward real evidence, tradeoffs, and measurable outcomes.
- Scorecard signals should read like what an interviewer would actually mark down.
- Avoid generic motivational language and obvious filler.`;

export async function generateMockPack(params: {
  targetRole: string;
  interviewType: string;
  seniority: string;
  industry: string;
  focusAreas?: string;
  companyContext?: string;
  interviewTypeLabel?: string;
  interviewTypeDescription?: string;
  sampleTopics?: string[];
}): Promise<MockPackOutput> {
  const prompt = `Create a role-specific mock interview prep pack.

Target role: ${params.targetRole}
Interview type: ${params.interviewTypeLabel || params.interviewType}
Interview type description: ${params.interviewTypeDescription || "Not provided"}
Seniority: ${params.seniority}
Industry: ${params.industry}
Focus areas: ${params.focusAreas || "General readiness"}
Company context hint: ${params.companyContext || "No extra context provided"}
Relevant topic hints: ${params.sampleTopics?.join(", ") || "No topic hints provided"}

Make it practical enough that a candidate can use it immediately before a mock interview.`;

  return callClaudeJSON<MockPackOutput>(SYSTEM_PROMPT, prompt, 2200);
}
