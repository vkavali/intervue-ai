import { callClaudeJSON } from "./ai-client";
import type { ProblemEntry } from "@/data/problem-bank";

export interface LearningBrief {
  summary: string;
  theoryHighlights: string[];
  codeReview: string[];
  errorDiagnosis: string[];
  nextSteps: string[];
  interviewFraming: string[];
}

const SYSTEM_PROMPT = `You are an AI learning coach for interview preparation. Create a concise learning brief that helps a candidate understand what they just worked on, where they are getting stuck, and what to do next.

Respond with ONLY a JSON object:
{
  "summary": "2-3 sentence summary of the candidate's current state and readiness on this problem",
  "theoryHighlights": ["short concept reminder", "short concept reminder"],
  "codeReview": ["specific observation about code quality or approach", "specific observation"],
  "errorDiagnosis": ["probable issue or failure mode", "probable issue or failure mode"],
  "nextSteps": ["clear next action", "clear next action", "clear next action"],
  "interviewFraming": ["how to explain the approach in an interview", "how to discuss tradeoffs", "what follow-up to prepare for"]
}

Rules:
- Keep every bullet concrete and short.
- If code is missing, focus on study strategy and theory instead of code critique.
- If tests are partially passing, explain the likely gap category rather than pretending to know the exact bug.
- If the candidate looks strong, focus on interview communication and optimization follow-ups.
- Do not use markdown fences.`;

export async function generateLearningBrief(params: {
  problem: ProblemEntry;
  code?: string | null;
  status: string;
  timeSpentSeconds: number;
  testsPassed: number;
  testsTotal: number;
  lastSubmissionStatus?: string | null;
}): Promise<LearningBrief> {
  const { problem, code, status, timeSpentSeconds, testsPassed, testsTotal, lastSubmissionStatus } = params;
  const minutes = Math.max(1, Math.round(timeSpentSeconds / 60));
  const trimmedCode = code ? code.slice(0, 4000) : "";

  const prompt = `Problem:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Category: ${problem.category}
Pattern: ${problem.pattern || "Unknown"}
Tags: ${problem.tags.join(", ")}
Description: ${problem.description}
${problem.constraints ? `Constraints: ${problem.constraints}` : ""}
${problem.examples ? `Examples: ${problem.examples}` : ""}

Candidate state:
Status: ${status}
Time spent: ${minutes} minutes
Tests passed: ${testsPassed}/${testsTotal}
Last submission status: ${lastSubmissionStatus || "none"}

Candidate code:
${trimmedCode || "No code available yet."}

Generate a learning brief that explains the theory, reviews the work, diagnoses likely issues, and gives next steps.`;

  return callClaudeJSON<LearningBrief>(SYSTEM_PROMPT, prompt, 1800);
}
