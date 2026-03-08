/**
 * AI Prompt Validator
 * Validates that prompts sent to AI endpoints are relevant to coding interviews
 * and not abusive, off-topic, or attempting prompt injection.
 */

// Maximum prompt length (characters)
const MAX_PROMPT_LENGTH = 5000;
const MAX_CODE_LENGTH = 50000;
const MAX_CONTEXT_LENGTH = 10000;

// Blocked patterns - prompt injection and abuse
const BLOCKED_PATTERNS: RegExp[] = [
  // Prompt injection attempts
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(all\s+)?above\s+instructions/i,
  /disregard\s+(all\s+)?previous/i,
  /forget\s+(all\s+)?previous/i,
  /you\s+are\s+now\s+(?:a|an)\s+(?!software|developer|programmer|coder|engineer)/i,
  /pretend\s+(?:you\s+are|to\s+be)\s+(?!a\s+(?:developer|programmer|interviewer|mentor))/i,
  /system\s*prompt/i,
  /\bDAN\b.*\bmode\b/i,
  /jailbreak/i,

  // Harmful content requests
  /how\s+to\s+(?:hack|exploit|attack|ddos|dos)\s/i,
  /write\s+(?:malware|virus|ransomware|trojan|keylogger)/i,
  /sql\s+injection\s+(?:attack|payload)/i,
  /cross[\s-]site\s+scripting\s+(?:attack|payload)/i,

  // Off-topic abuse
  /write\s+(?:me\s+)?(?:a\s+)?(?:poem|song|story|essay|letter|email)(?!\s+about\s+(?:code|programming|algorithm))/i,
  /(?:translate|convert)\s+(?:this\s+)?(?:to|into)\s+(?:french|spanish|german|chinese|japanese|korean|arabic|hindi|russian)/i,
];

// Required context patterns - at least one should match for the prompt to be relevant
const RELEVANCE_INDICATORS: RegExp[] = [
  // Code-related keywords
  /\b(?:code|function|algorithm|bug|error|compile|runtime|syntax|variable|array|string|object|class|method|loop|recursion|sort|search|tree|graph|stack|queue|hash|linked\s*list)\b/i,
  // Programming languages
  /\b(?:javascript|typescript|python|java|c\+\+|go|rust|ruby|swift|kotlin|sql|html|css|react|node|express|django|flask|spring)\b/i,
  // Interview/problem-solving context
  /\b(?:interview|problem|solution|optimize|complexity|time\s*complexity|space\s*complexity|big[\s-]?o|approach|implement|design|test\s*case|edge\s*case|constraint)\b/i,
  // Debugging/help context
  /\b(?:help|hint|explain|why|how|what|fix|debug|refactor|improve|review|check|wrong|correct|better|faster|efficient)\b/i,
  // Data structures and algorithms
  /\b(?:binary|heap|trie|dynamic\s*programming|greedy|backtrack|bfs|dfs|dijkstra|merge|quick|insertion|selection|bubble)\b/i,
];

export interface PromptValidationResult {
  valid: boolean;
  error?: string;
  sanitizedPrompt?: string;
  sanitizedCode?: string;
  sanitizedContext?: string;
}

/**
 * Validate and sanitize an AI prompt for coding interview relevance.
 */
export function validateAIPrompt(params: {
  prompt: string;
  code?: string;
  questionContext?: string;
}): PromptValidationResult {
  const { prompt, code, questionContext } = params;

  // Check prompt length
  if (!prompt || typeof prompt !== "string") {
    return { valid: false, error: "Prompt is required and must be a string." };
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return {
      valid: false,
      error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters.`,
    };
  }

  // Check code length
  if (code && code.length > MAX_CODE_LENGTH) {
    return {
      valid: false,
      error: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters.`,
    };
  }

  // Check context length
  if (questionContext && questionContext.length > MAX_CONTEXT_LENGTH) {
    return {
      valid: false,
      error: `Question context exceeds maximum length of ${MAX_CONTEXT_LENGTH} characters.`,
    };
  }

  // Check for blocked patterns
  const combinedText = `${prompt} ${code || ""} ${questionContext || ""}`;
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(combinedText)) {
      return {
        valid: false,
        error: "Your request contains content that is not allowed. Please rephrase your question to be about the coding problem.",
      };
    }
  }

  // Check relevance - prompt OR code OR context should contain relevant content
  const hasRelevantPrompt = RELEVANCE_INDICATORS.some((p) => p.test(prompt));
  const hasCode = code && code.trim().length > 0;
  const hasContext = questionContext && questionContext.trim().length > 0;

  if (!hasRelevantPrompt && !hasCode && !hasContext) {
    return {
      valid: false,
      error: "Your question doesn't appear to be related to coding or the interview problem. Please ask about the problem, your code, or programming concepts.",
    };
  }

  // Sanitize - trim and remove excessive whitespace
  const sanitizedPrompt = prompt.trim().replace(/\s+/g, " ");
  const sanitizedCode = code?.trim();
  const sanitizedContext = questionContext?.trim();

  return {
    valid: true,
    sanitizedPrompt,
    sanitizedCode,
    sanitizedContext,
  };
}

/**
 * Validate a practice question generation request.
 */
export function validateGenerationPrompt(params: {
  role?: string;
  company?: string;
  jobDescription?: string;
  difficulty?: string;
}): PromptValidationResult {
  const { role, company, jobDescription, difficulty } = params;

  // Validate role
  if (role && role.length > 200) {
    return { valid: false, error: "Role description is too long." };
  }

  // Validate company
  if (company && company.length > 100) {
    return { valid: false, error: "Company name is too long." };
  }

  // Validate job description
  if (jobDescription && jobDescription.length > 5000) {
    return { valid: false, error: "Job description exceeds maximum length." };
  }

  // Check for blocked patterns in all fields
  const combinedText = `${role || ""} ${company || ""} ${jobDescription || ""} ${difficulty || ""}`;
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(combinedText)) {
      return {
        valid: false,
        error: "Your request contains content that is not allowed.",
      };
    }
  }

  // Validate difficulty
  if (difficulty && !["EASY", "MEDIUM", "HARD", "MIX"].includes(difficulty)) {
    return { valid: false, error: "Invalid difficulty level." };
  }

  return { valid: true };
}
