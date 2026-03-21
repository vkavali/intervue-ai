export interface ScoringDimensions {
  problemComprehension: string;
  solutionCorrectness: string;
  codeQuality: string;
  communication: string;
  aiUsageQuality: string;
  timeManagement: string;
}

export interface InterviewTypeConfig {
  value: string;
  label: string;
  description: string;
  hasCodeEditor: boolean;
  questionTypes: string[];
  sampleTopics: string[];
  department?: string;
  scoringDimensions: ScoringDimensions;
}

const DEFAULT_ENGINEERING_DIMENSIONS: ScoringDimensions = {
  problemComprehension: "Problem Comprehension",
  solutionCorrectness: "Solution Correctness",
  codeQuality: "Code Quality",
  communication: "Communication",
  aiUsageQuality: "AI Usage Quality",
  timeManagement: "Time Management",
};

export const INTERVIEW_TYPES: InterviewTypeConfig[] = [
  // ─── Engineering / Technical ──────────────────────────────────────────
  {
    value: "TECHNICAL",
    label: "Technical / Coding",
    description: "Data structures, algorithms, and coding challenges",
    hasCodeEditor: true,
    questionTypes: ["coding", "algorithm", "data-structure"],
    sampleTopics: ["Arrays", "Trees", "Dynamic Programming", "Graphs", "Sorting"],
    department: "Engineering",
    scoringDimensions: DEFAULT_ENGINEERING_DIMENSIONS,
  },
  {
    value: "SYSTEM_DESIGN",
    label: "System Design",
    description: "Architecture, scalability, and system design problems",
    hasCodeEditor: true,
    questionTypes: ["design", "architecture", "trade-off"],
    sampleTopics: ["Load Balancing", "Database Sharding", "Caching", "Microservices", "API Design"],
    department: "Engineering",
    scoringDimensions: DEFAULT_ENGINEERING_DIMENSIONS,
  },
  {
    value: "SQL",
    label: "SQL / Database",
    description: "SQL queries, schema design, and database concepts",
    hasCodeEditor: true,
    questionTypes: ["sql-query", "schema-design", "optimization"],
    sampleTopics: ["JOINs", "Aggregations", "Window Functions", "Indexing", "Normalization"],
    department: "Engineering",
    scoringDimensions: DEFAULT_ENGINEERING_DIMENSIONS,
  },
  {
    value: "BEHAVIORAL",
    label: "Behavioral",
    description: "Soft skills, leadership, and situational questions",
    hasCodeEditor: false,
    questionTypes: ["behavioral", "situational", "leadership"],
    sampleTopics: ["Conflict Resolution", "Team Leadership", "Problem Solving", "Communication"],
    department: "General",
    scoringDimensions: {
      problemComprehension: "Situation Understanding",
      solutionCorrectness: "Response Quality",
      codeQuality: "Self-Awareness",
      communication: "Communication",
      aiUsageQuality: "Critical Thinking",
      timeManagement: "Time Management",
    },
  },
  {
    value: "BUSINESS_ANALYST",
    label: "Business Analyst",
    description: "Requirements gathering, case studies, and analysis",
    hasCodeEditor: false,
    questionTypes: ["case-study", "requirements", "analysis"],
    sampleTopics: ["Requirements Elicitation", "Process Modeling", "Stakeholder Management", "Data Analysis"],
    department: "Product",
    scoringDimensions: {
      problemComprehension: "Requirements Understanding",
      solutionCorrectness: "Analysis Quality",
      codeQuality: "Documentation",
      communication: "Communication",
      aiUsageQuality: "Analytical Thinking",
      timeManagement: "Time Management",
    },
  },
  {
    value: "PROJECT_MANAGEMENT",
    label: "Project Management",
    description: "Planning, estimation, and project scenarios",
    hasCodeEditor: false,
    questionTypes: ["scenario", "planning", "estimation"],
    sampleTopics: ["Agile/Scrum", "Risk Management", "Resource Planning", "Sprint Planning", "Stakeholder Communication"],
    department: "General",
    scoringDimensions: {
      problemComprehension: "Problem Framing",
      solutionCorrectness: "Planning Quality",
      codeQuality: "Risk Assessment",
      communication: "Communication",
      aiUsageQuality: "Strategic Thinking",
      timeManagement: "Time Management",
    },
  },
  {
    value: "DEVOPS",
    label: "DevOps / Infrastructure",
    description: "CI/CD, cloud infrastructure, and deployment scenarios",
    hasCodeEditor: true,
    questionTypes: ["scenario", "infrastructure", "troubleshooting"],
    sampleTopics: ["CI/CD Pipelines", "Docker/Kubernetes", "Cloud Architecture", "Monitoring", "IaC"],
    department: "Engineering",
    scoringDimensions: DEFAULT_ENGINEERING_DIMENSIONS,
  },
  {
    value: "GENERAL",
    label: "General",
    description: "Mixed format interview with flexible question types",
    hasCodeEditor: true,
    questionTypes: ["mixed"],
    sampleTopics: ["Role-specific"],
    department: "General",
    scoringDimensions: DEFAULT_ENGINEERING_DIMENSIONS,
  },

  // ─── Sales ────────────────────────────────────────────────────────────
  {
    value: "SALES",
    label: "Sales",
    description: "Discovery calls, objection handling, and pitch scenarios",
    hasCodeEditor: false,
    questionTypes: ["role-play", "scenario", "case-study"],
    sampleTopics: ["Discovery Calls", "Objection Handling", "Pitch Delivery", "Pipeline Management", "Negotiation"],
    department: "Sales",
    scoringDimensions: {
      problemComprehension: "Needs Discovery",
      solutionCorrectness: "Solution Fit",
      codeQuality: "Persuasion",
      communication: "Communication",
      aiUsageQuality: "Objection Handling",
      timeManagement: "Closing Ability",
    },
  },

  // ─── Marketing ────────────────────────────────────────────────────────
  {
    value: "MARKETING",
    label: "Marketing",
    description: "Campaign strategy, analytics interpretation, and brand scenarios",
    hasCodeEditor: false,
    questionTypes: ["case-study", "strategy", "analytics"],
    sampleTopics: ["Campaign Strategy", "Growth Marketing", "Brand Positioning", "Marketing Analytics", "Content Strategy"],
    department: "Marketing",
    scoringDimensions: {
      problemComprehension: "Brief Understanding",
      solutionCorrectness: "Strategy Soundness",
      codeQuality: "Creativity",
      communication: "Communication",
      aiUsageQuality: "Data Interpretation",
      timeManagement: "Time Management",
    },
  },

  // ─── Executive ────────────────────────────────────────────────────────
  {
    value: "EXECUTIVE",
    label: "Executive",
    description: "Leadership vision, board presentations, and P&L analysis",
    hasCodeEditor: false,
    questionTypes: ["case-study", "leadership", "strategy"],
    sampleTopics: ["Leadership Vision", "Board Presentations", "P&L Analysis", "Org Design", "Change Management"],
    department: "Executive",
    scoringDimensions: {
      problemComprehension: "Problem Framing",
      solutionCorrectness: "Decision Quality",
      codeQuality: "Leadership Presence",
      communication: "Communication",
      aiUsageQuality: "Strategic Thinking",
      timeManagement: "Time Management",
    },
  },

  // ─── Product ──────────────────────────────────────────────────────────
  {
    value: "PRODUCT",
    label: "Product Management",
    description: "PRD writing, prioritization, and metrics definition",
    hasCodeEditor: false,
    questionTypes: ["case-study", "prioritization", "metrics"],
    sampleTopics: ["PRD Writing", "Feature Prioritization", "Metrics & KPIs", "User Research", "Roadmap Planning"],
    department: "Product",
    scoringDimensions: {
      problemComprehension: "Problem Framing",
      solutionCorrectness: "Prioritization",
      codeQuality: "Communication",
      communication: "Technical Depth",
      aiUsageQuality: "Metrics Thinking",
      timeManagement: "Time Management",
    },
  },

  // ─── Customer Success ─────────────────────────────────────────────────
  {
    value: "CUSTOMER_SUCCESS",
    label: "Customer Success",
    description: "Escalation handling, QBR scenarios, and retention strategies",
    hasCodeEditor: false,
    questionTypes: ["scenario", "role-play", "case-study"],
    sampleTopics: ["Escalation Handling", "QBR Preparation", "Churn Prevention", "Onboarding", "Renewal Strategy"],
    department: "Customer Success",
    scoringDimensions: {
      problemComprehension: "Customer Understanding",
      solutionCorrectness: "Resolution Quality",
      codeQuality: "Empathy & Rapport",
      communication: "Communication",
      aiUsageQuality: "Retention Strategy",
      timeManagement: "Time Management",
    },
  },

  // ─── HR ───────────────────────────────────────────────────────────────
  {
    value: "HR",
    label: "Human Resources",
    description: "Policy scenarios, conflict resolution, and compensation analysis",
    hasCodeEditor: false,
    questionTypes: ["scenario", "policy", "case-study"],
    sampleTopics: ["Policy Scenarios", "Conflict Resolution", "Compensation Analysis", "Employee Relations", "Compliance"],
    department: "HR",
    scoringDimensions: {
      problemComprehension: "Situation Assessment",
      solutionCorrectness: "Policy Application",
      codeQuality: "Judgment & Fairness",
      communication: "Communication",
      aiUsageQuality: "Legal Awareness",
      timeManagement: "Time Management",
    },
  },

  // ─── Finance ──────────────────────────────────────────────────────────
  {
    value: "FINANCE",
    label: "Finance",
    description: "Financial modeling, budgeting, and audit scenarios",
    hasCodeEditor: false,
    questionTypes: ["case-study", "modeling", "analysis"],
    sampleTopics: ["Financial Modeling", "Budgeting & Forecasting", "Variance Analysis", "Audit Scenarios", "Risk Assessment"],
    department: "Finance",
    scoringDimensions: {
      problemComprehension: "Problem Comprehension",
      solutionCorrectness: "Analytical Accuracy",
      codeQuality: "Modeling Quality",
      communication: "Communication",
      aiUsageQuality: "Financial Judgment",
      timeManagement: "Time Management",
    },
  },

  // ─── Legal ────────────────────────────────────────────────────────────
  {
    value: "LEGAL",
    label: "Legal",
    description: "Contract review, compliance, and regulatory analysis",
    hasCodeEditor: false,
    questionTypes: ["case-study", "review", "analysis"],
    sampleTopics: ["Contract Review", "Compliance Scenarios", "Regulatory Analysis", "IP Protection", "Risk Mitigation"],
    department: "Legal",
    scoringDimensions: {
      problemComprehension: "Issue Identification",
      solutionCorrectness: "Legal Analysis",
      codeQuality: "Drafting Quality",
      communication: "Communication",
      aiUsageQuality: "Regulatory Knowledge",
      timeManagement: "Time Management",
    },
  },
];

export const INDUSTRIES = [
  "Technology",
  "Finance / Banking",
  "Healthcare",
  "E-commerce / Retail",
  "Media / Entertainment",
  "Education",
  "Manufacturing",
  "Consulting",
  "Government",
  "Telecommunications",
  "Other",
];

export const DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Marketing",
  "Executive",
  "Product",
  "Customer Success",
  "HR",
  "Finance",
  "Legal",
  "General",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export function getInterviewType(value: string): InterviewTypeConfig | undefined {
  return INTERVIEW_TYPES.find((t) => t.value === value);
}

export function isNonCodingType(interviewType: string): boolean {
  const config = getInterviewType(interviewType);
  if (!config) return false;
  return !config.hasCodeEditor;
}

export function getScoringDimensions(interviewType: string): ScoringDimensions {
  const config = getInterviewType(interviewType);
  return config?.scoringDimensions ?? DEFAULT_ENGINEERING_DIMENSIONS;
}

export function getTypesByDepartment(department: string): InterviewTypeConfig[] {
  return INTERVIEW_TYPES.filter((t) => t.department === department);
}
