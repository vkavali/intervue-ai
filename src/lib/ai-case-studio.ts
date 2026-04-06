import { callClaudeJSON } from "./ai-client";

export interface CaseStudioQuestion {
  question: string;
  whatStrongAnswerShows: string;
}

export interface CaseStudioOutput {
  title: string;
  roleSummary: string;
  companyContext: string;
  businessGoal: string;
  scenarioBrief: string;
  constraints: string[];
  deliverables: string[];
  executionPlan: string[];
  evaluationCriteria: string[];
  presentationChecklist: string[];
  portfolioProof: string[];
  mockInterviewQuestions: CaseStudioQuestion[];
}

const SYSTEM_PROMPT = `You are an expert hiring case designer for modern business roles. You create realistic case exercises that help candidates practice for roles like product, sales, marketing, project management, customer success, HR, finance, operations, and AI automation.

Respond with ONLY a JSON object:
{
  "title": "short case title",
  "roleSummary": "1-2 sentence summary of what this role is expected to do",
  "companyContext": "2-3 sentence hypothetical company situation",
  "businessGoal": "single clear goal the candidate is trying to achieve",
  "scenarioBrief": "detailed but concise case brief, 120-220 words",
  "constraints": ["constraint", "constraint", "constraint", "constraint"],
  "deliverables": ["deliverable", "deliverable", "deliverable", "deliverable"],
  "executionPlan": ["step", "step", "step", "step", "step"],
  "evaluationCriteria": ["criterion", "criterion", "criterion", "criterion", "criterion"],
  "presentationChecklist": ["presentation item", "presentation item", "presentation item", "presentation item"],
  "portfolioProof": ["resume bullet angle", "portfolio artifact angle", "recruiter proof angle"],
  "mockInterviewQuestions": [
    {
      "question": "interview question tied to this case",
      "whatStrongAnswerShows": "what a strong answer demonstrates"
    }
  ]
}

Rules:
- The company and case should be realistic but clearly hypothetical.
- Make the case feel like real work, not classroom fluff.
- Prefer business decisions, prioritization, communication, analysis, tradeoffs, and execution thinking.
- If the interview type is non-coding, do not turn the task into a coding problem.
- Keep deliverables specific enough that a candidate could actually work from them.
- Make evaluation criteria recruiter-friendly and concrete.
- Portfolio proof should help the candidate convert the case into evidence for applications.
- Avoid hype, inflated metrics, and bootcamp language.`;

export async function generateCaseStudio(params: {
  targetRole: string;
  interviewType: string;
  seniority: string;
  industry: string;
  scenarioFocus?: string;
  companyContext?: string;
  interviewTypeLabel?: string;
  interviewTypeDescription?: string;
  sampleTopics?: string[];
}): Promise<CaseStudioOutput> {
  const prompt = `Create a realistic hiring case for this candidate.

Target role: ${params.targetRole}
Interview type: ${params.interviewTypeLabel || params.interviewType}
Interview type description: ${params.interviewTypeDescription || "Not provided"}
Seniority: ${params.seniority}
Industry: ${params.industry}
Scenario focus: ${params.scenarioFocus || "General role readiness"}
Company context hint: ${params.companyContext || "No extra context provided"}
Relevant topic hints: ${params.sampleTopics?.join(", ") || "No topic hints provided"}

Build a practical case that feels like a real brief from a hiring manager.`;

  return callClaudeJSON<CaseStudioOutput>(SYSTEM_PROMPT, prompt, 2400);
}
