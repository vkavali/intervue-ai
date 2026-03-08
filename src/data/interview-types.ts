export interface InterviewTypeConfig {
  value: string;
  label: string;
  description: string;
  hasCodeEditor: boolean;
  questionTypes: string[];
  sampleTopics: string[];
}

export const INTERVIEW_TYPES: InterviewTypeConfig[] = [
  {
    value: "TECHNICAL",
    label: "Technical / Coding",
    description: "Data structures, algorithms, and coding challenges",
    hasCodeEditor: true,
    questionTypes: ["coding", "algorithm", "data-structure"],
    sampleTopics: ["Arrays", "Trees", "Dynamic Programming", "Graphs", "Sorting"],
  },
  {
    value: "SYSTEM_DESIGN",
    label: "System Design",
    description: "Architecture, scalability, and system design problems",
    hasCodeEditor: true,
    questionTypes: ["design", "architecture", "trade-off"],
    sampleTopics: ["Load Balancing", "Database Sharding", "Caching", "Microservices", "API Design"],
  },
  {
    value: "SQL",
    label: "SQL / Database",
    description: "SQL queries, schema design, and database concepts",
    hasCodeEditor: true,
    questionTypes: ["sql-query", "schema-design", "optimization"],
    sampleTopics: ["JOINs", "Aggregations", "Window Functions", "Indexing", "Normalization"],
  },
  {
    value: "BEHAVIORAL",
    label: "Behavioral",
    description: "Soft skills, leadership, and situational questions",
    hasCodeEditor: false,
    questionTypes: ["behavioral", "situational", "leadership"],
    sampleTopics: ["Conflict Resolution", "Team Leadership", "Problem Solving", "Communication"],
  },
  {
    value: "BUSINESS_ANALYST",
    label: "Business Analyst",
    description: "Requirements gathering, case studies, and analysis",
    hasCodeEditor: false,
    questionTypes: ["case-study", "requirements", "analysis"],
    sampleTopics: ["Requirements Elicitation", "Process Modeling", "Stakeholder Management", "Data Analysis"],
  },
  {
    value: "PROJECT_MANAGEMENT",
    label: "Project Management",
    description: "Planning, estimation, and project scenarios",
    hasCodeEditor: false,
    questionTypes: ["scenario", "planning", "estimation"],
    sampleTopics: ["Agile/Scrum", "Risk Management", "Resource Planning", "Sprint Planning", "Stakeholder Communication"],
  },
  {
    value: "DEVOPS",
    label: "DevOps / Infrastructure",
    description: "CI/CD, cloud infrastructure, and deployment scenarios",
    hasCodeEditor: true,
    questionTypes: ["scenario", "infrastructure", "troubleshooting"],
    sampleTopics: ["CI/CD Pipelines", "Docker/Kubernetes", "Cloud Architecture", "Monitoring", "IaC"],
  },
  {
    value: "GENERAL",
    label: "General",
    description: "Mixed format interview with flexible question types",
    hasCodeEditor: true,
    questionTypes: ["mixed"],
    sampleTopics: ["Role-specific"],
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

export function getInterviewType(value: string): InterviewTypeConfig | undefined {
  return INTERVIEW_TYPES.find((t) => t.value === value);
}
