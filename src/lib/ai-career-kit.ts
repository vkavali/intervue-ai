import { callClaudeJSON } from "./ai-client";

export interface CareerKitOutput {
  headline: string;
  about: string;
  resumeBullets: string[];
  keywordGaps: string[];
  recruiterMessage: string;
  interviewPitch: string;
  actionPlan: string[];
}

const SYSTEM_PROMPT = `You are an expert career strategist, resume writer, and LinkedIn coach for candidates transitioning into or growing within tech roles.

Respond with ONLY a JSON object:
{
  "headline": "short LinkedIn headline under 220 characters",
  "about": "LinkedIn About section in first person, 120-220 words",
  "resumeBullets": ["achievement-focused bullet", "achievement-focused bullet", "achievement-focused bullet", "achievement-focused bullet"],
  "keywordGaps": ["missing keyword or proof area", "missing keyword or proof area", "missing keyword or proof area"],
  "recruiterMessage": "short outbound note to a recruiter, under 120 words",
  "interviewPitch": "45-60 second spoken pitch in first person",
  "actionPlan": ["concrete next step", "concrete next step", "concrete next step", "concrete next step"]
}

Rules:
- Write in plain, credible language. Avoid hype and generic buzzwords.
- Make resume bullets measurable where possible.
- Use the candidate's verified interview and practice signals when available.
- If experience is limited, lean on transferable skills and verified practice evidence.
- Do not invent employers, metrics, or background details that were not provided or implied.
- Keep every action plan step concrete.`;

export async function generateCareerKit(params: {
  targetRole: string;
  yearsExperience: string;
  backgroundSummary: string;
  achievements: string;
  currentHeadline?: string;
  currentAbout?: string;
  existingBullets?: string;
  jobDescription?: string;
  performanceContext?: string;
}): Promise<CareerKitOutput> {
  const prompt = `Candidate target:
Role: ${params.targetRole}
Years of experience: ${params.yearsExperience || "Not specified"}

Background summary:
${params.backgroundSummary}

Achievements / evidence:
${params.achievements}

Current LinkedIn headline:
${params.currentHeadline || "Not provided"}

Current LinkedIn about:
${params.currentAbout || "Not provided"}

Existing resume bullets:
${params.existingBullets || "Not provided"}

Target job description:
${params.jobDescription || "Not provided"}

Verified theprintf.com performance context:
${params.performanceContext || "No verified context available."}

Generate a practical career kit tailored to this candidate.`;

  return callClaudeJSON<CareerKitOutput>(SYSTEM_PROMPT, prompt, 2200);
}
