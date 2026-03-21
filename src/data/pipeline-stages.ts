export interface PipelineStage {
  value: string;
  label: string;
  color: string; // Tailwind class string for bg/text/border
}

export interface DepartmentPipeline {
  department: string;
  stages: PipelineStage[];
}

const TERMINAL_STAGES: PipelineStage[] = [
  { value: "HIRED", label: "Hired", color: "bg-green-500/10 text-green-400 border-green-500/30" },
  { value: "REJECTED", label: "Rejected", color: "bg-accent-red/10 text-accent-red border-accent-red/30" },
  { value: "ON_HOLD", label: "On Hold", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
];

export const DEPARTMENT_PIPELINES: DepartmentPipeline[] = [
  {
    department: "Engineering",
    stages: [
      { value: "SCREENING", label: "Screening", color: "bg-india-green/10 text-india-green border-india-green/30" },
      { value: "TECHNICAL", label: "Technical", color: "bg-saffron/10 text-saffron border-saffron/30" },
      { value: "SYSTEM_DESIGN", label: "System Design", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
      { value: "BEHAVIORAL", label: "Behavioral", color: "bg-teal-500/10 text-teal-400 border-teal-500/30" },
      { value: "FINAL", label: "Final", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" },
      ...TERMINAL_STAGES,
    ],
  },
  {
    department: "Sales",
    stages: [
      { value: "SCREENING", label: "Screening", color: "bg-india-green/10 text-india-green border-india-green/30" },
      { value: "DISCOVERY_CALL", label: "Discovery Call", color: "bg-saffron/10 text-saffron border-saffron/30" },
      { value: "ROLE_PLAY", label: "Role Play", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
      { value: "MANAGER_INTERVIEW", label: "Manager Interview", color: "bg-teal-500/10 text-teal-400 border-teal-500/30" },
      { value: "FINAL", label: "Final", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" },
      ...TERMINAL_STAGES,
    ],
  },
  {
    department: "Executive",
    stages: [
      { value: "SCREENING", label: "Screening", color: "bg-india-green/10 text-india-green border-india-green/30" },
      { value: "LEADERSHIP_ASSESSMENT", label: "Leadership Assessment", color: "bg-saffron/10 text-saffron border-saffron/30" },
      { value: "BOARD_PRESENTATION", label: "Board Presentation", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
      { value: "REFERENCE_CHECK", label: "Reference Check", color: "bg-teal-500/10 text-teal-400 border-teal-500/30" },
      { value: "FINAL", label: "Final", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" },
      ...TERMINAL_STAGES,
    ],
  },
  {
    department: "Marketing",
    stages: [
      { value: "SCREENING", label: "Screening", color: "bg-india-green/10 text-india-green border-india-green/30" },
      { value: "PORTFOLIO_REVIEW", label: "Portfolio Review", color: "bg-saffron/10 text-saffron border-saffron/30" },
      { value: "STRATEGY_CASE", label: "Strategy Case", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
      { value: "FINAL", label: "Final", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" },
      ...TERMINAL_STAGES,
    ],
  },
  {
    department: "Product",
    stages: [
      { value: "SCREENING", label: "Screening", color: "bg-india-green/10 text-india-green border-india-green/30" },
      { value: "PRODUCT_CASE", label: "Product Case", color: "bg-saffron/10 text-saffron border-saffron/30" },
      { value: "METRICS_REVIEW", label: "Metrics Review", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
      { value: "CROSS_FUNCTIONAL", label: "Cross-Functional", color: "bg-teal-500/10 text-teal-400 border-teal-500/30" },
      { value: "FINAL", label: "Final", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" },
      ...TERMINAL_STAGES,
    ],
  },
  {
    department: "Customer Success",
    stages: [
      { value: "SCREENING", label: "Screening", color: "bg-india-green/10 text-india-green border-india-green/30" },
      { value: "CS_SCENARIO", label: "CS Scenario", color: "bg-saffron/10 text-saffron border-saffron/30" },
      { value: "ESCALATION_SIM", label: "Escalation Sim", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
      { value: "FINAL", label: "Final", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" },
      ...TERMINAL_STAGES,
    ],
  },
  {
    department: "HR",
    stages: [
      { value: "SCREENING", label: "Screening", color: "bg-india-green/10 text-india-green border-india-green/30" },
      { value: "POLICY_CASE", label: "Policy Case", color: "bg-saffron/10 text-saffron border-saffron/30" },
      { value: "PANEL_INTERVIEW", label: "Panel Interview", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
      { value: "FINAL", label: "Final", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" },
      ...TERMINAL_STAGES,
    ],
  },
  {
    department: "Finance",
    stages: [
      { value: "SCREENING", label: "Screening", color: "bg-india-green/10 text-india-green border-india-green/30" },
      { value: "MODELING_TEST", label: "Modeling Test", color: "bg-saffron/10 text-saffron border-saffron/30" },
      { value: "CASE_STUDY", label: "Case Study", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
      { value: "FINAL", label: "Final", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" },
      ...TERMINAL_STAGES,
    ],
  },
  {
    department: "Legal",
    stages: [
      { value: "SCREENING", label: "Screening", color: "bg-india-green/10 text-india-green border-india-green/30" },
      { value: "CONTRACT_REVIEW", label: "Contract Review", color: "bg-saffron/10 text-saffron border-saffron/30" },
      { value: "COMPLIANCE_CASE", label: "Compliance Case", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
      { value: "FINAL", label: "Final", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" },
      ...TERMINAL_STAGES,
    ],
  },
];

// Default pipeline (Engineering) for unknown departments
const DEFAULT_PIPELINE = DEPARTMENT_PIPELINES[0];

export function getStagesForDepartment(department?: string | null): PipelineStage[] {
  if (!department) return DEFAULT_PIPELINE.stages;
  const pipeline = DEPARTMENT_PIPELINES.find(
    (p) => p.department.toLowerCase() === department.toLowerCase()
  );
  return pipeline?.stages || DEFAULT_PIPELINE.stages;
}

export function getValidStageValues(department?: string | null): string[] {
  return getStagesForDepartment(department).map((s) => s.value);
}

export function getStageColor(stage: string, department?: string | null): string {
  const stages = getStagesForDepartment(department);
  const found = stages.find((s) => s.value === stage);
  return found?.color || "bg-gray-500/10 text-gray-500 border-gray-500/30";
}

export function getStageLabel(stage: string, department?: string | null): string {
  const stages = getStagesForDepartment(department);
  const found = stages.find((s) => s.value === stage);
  return found?.label || stage.replace(/_/g, " ");
}
