import { create } from 'zustand';

export type ProgramHealth = 'On Track' | 'At Risk' | 'Critical';
export type ProjectStatus = 'Planning' | 'In Progress' | 'Completed';

export interface StrategicProgram {
  id: string;
  title: string;
  leadName: string;
  budget: number;
  spent: number;
  health: ProgramHealth;
}

export interface EnterpriseProject {
  id: string;
  projectName: string;
  programId: string;
  completionPercent: number;
  status: ProjectStatus;
}

export interface ProjectTask {
  id: string;
  taskName: string;
  assignee: string;
  dueDate: string;
  status: 'To Do' | 'In Progress' | 'Completed';
}

export interface PmoRecommendation {
  id: string;
  title: string;
  recommendation: string;
  impactEstimate: string;
  confidenceScore: number; // 0..100
  explainabilityWhy: string;
}

export interface ProjectSimulationScenario {
  id: string;
  type: 'Schedule' | 'Resource' | 'Budget' | 'Delivery' | 'PortfolioOptimization';
  title: string;
  projectedVelocityGain: number; // %
  riskScore: number; // 0..100
  simulationPass: boolean;
}

export interface PortfolioAuditFinding {
  id: string;
  findingTitle: string;
  severity: 'High' | 'Medium' | 'Low';
  evidence: string;
  status: 'Open' | 'Mitigated' | 'Dismissed';
}

interface ProjectPortfolioState {
  portfolioHealthScore: number;
  strategicAlignmentPercent: number;
  activeProgramsCount: number;
  activeProjectsCount: number;
  budgetUtilizationPercent: number;
  scheduleHealthPercent: number;
  portfolioRisksCount: number;

  programs: StrategicProgram[];
  projects: EnterpriseProject[];
  tasks: ProjectTask[];
  pmoRecommendations: PmoRecommendation[];
  simulations: ProjectSimulationScenario[];
  auditFindings: PortfolioAuditFinding[];

  // Actions
  updateProjectStatus: (id: string, newStatus: ProjectStatus) => void;
  runProjectSimulation: (type: ProjectSimulationScenario['type'], title: string) => ProjectSimulationScenario;
  resolvePortfolioAuditFinding: (id: string) => void;
}

const DEFAULT_PROGRAMS: StrategicProgram[] = [
  { id: 'prg-1', title: 'Sidra OS Enterprise Capabilities Program (E08-E17)', leadName: 'Chief Product Architect', budget: 12000000, spent: 8400000, health: 'On Track' },
  { id: 'prg-2', title: 'Global Multi-Region Cloud & Autonomous Org Engine', leadName: 'VP Autonomous Systems', budget: 8500000, spent: 5100000, health: 'On Track' },
];

const DEFAULT_PROJECTS: EnterpriseProject[] = [
  { id: 'prj-1', projectName: 'E17 Project & Portfolio Intelligence Suite', programId: 'prg-1', completionPercent: 96, status: 'In Progress' },
  { id: 'prj-2', projectName: 'E16 Supply Chain & Procurement Intelligence Suite', programId: 'prg-1', completionPercent: 100, status: 'Completed' },
];

const DEFAULT_TASKS: ProjectTask[] = [
  { id: 'tsk-p1', taskName: 'Finalize Virtual AI PMO Earned Value Financials Engine', assignee: 'Principal AI Architect', dueDate: '2026-08-05', status: 'Completed' },
  { id: 'tsk-p2', taskName: 'Conduct Project Digital Twin Scenario Verification', assignee: 'Principal React Engineer', dueDate: '2026-08-10', status: 'In Progress' },
];

const DEFAULT_PMO_RECOMMENDATIONS: PmoRecommendation[] = [
  {
    id: 'pmo-rec-1',
    title: 'Fast-Track Game Studio Suite Integration Milestones',
    recommendation: 'Reallocate 2 senior engineers from completed E16 Supply Chain project to accelerate E18 Game Studio Suite development by 2 weeks.',
    impactEstimate: '14 Days Faster Release',
    confidenceScore: 98,
    explainabilityWhy: 'Completed E16 engineering capacity is 100% available without impacting active portfolio commitments.',
  },
  {
    id: 'pmo-rec-2',
    title: 'Automate Milestone Schedule Tracking via Digital Twin',
    recommendation: 'Connect milestone updates directly to Digital Twin simulation models to reduce schedule variance by 34%.',
    impactEstimate: '34% Lower Variance',
    confidenceScore: 96,
    explainabilityWhy: 'Real-time telemetry provides automated early warning indicators 12 days before milestone risk events.',
  },
];

const DEFAULT_SIMULATIONS: ProjectSimulationScenario[] = [
  { id: 'sim-prj-1', type: 'PortfolioOptimization', title: 'Global Enterprise Project Portfolio Optimization Simulation', projectedVelocityGain: 26, riskScore: 6, simulationPass: true },
  { id: 'sim-prj-2', type: 'Schedule', title: 'Critical Path Acceleration Scenario Simulation', projectedVelocityGain: 32, riskScore: 8, simulationPass: true },
];

const DEFAULT_AUDIT_FINDINGS: PortfolioAuditFinding[] = [
  { id: 'aud-prj-1', findingTitle: 'Verified SHA-256 Project Milestone Traceability in Vault', severity: 'Low', evidence: '100% of project milestone commits logged with immutable cryptographic signatures.', status: 'Mitigated' },
];

export const useProjectPortfolioStore = create<ProjectPortfolioState>((set) => ({
  portfolioHealthScore: 99,
  strategicAlignmentPercent: 98,
  activeProgramsCount: 6,
  activeProjectsCount: 28,
  budgetUtilizationPercent: 84,
  scheduleHealthPercent: 96,
  portfolioRisksCount: 0,

  programs: DEFAULT_PROGRAMS,
  projects: DEFAULT_PROJECTS,
  tasks: DEFAULT_TASKS,
  pmoRecommendations: DEFAULT_PMO_RECOMMENDATIONS,
  simulations: DEFAULT_SIMULATIONS,
  auditFindings: DEFAULT_AUDIT_FINDINGS,

  updateProjectStatus: (id, newStatus) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
    })),

  runProjectSimulation: (type, title) => {
    const newSim: ProjectSimulationScenario = {
      id: `sim-prj-${Date.now()}`,
      type,
      title,
      projectedVelocityGain: 28,
      riskScore: 7,
      simulationPass: true,
    };

    set((state) => ({ simulations: [newSim, ...state.simulations] }));
    return newSim;
  },

  resolvePortfolioAuditFinding: (id) =>
    set((state) => ({
      auditFindings: state.auditFindings.map((f) => (f.id === id ? { ...f, status: 'Mitigated' } : f)),
    })),
}));
