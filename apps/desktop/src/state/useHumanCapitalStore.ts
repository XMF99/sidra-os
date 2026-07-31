import { create } from 'zustand';

export type CandidateStage = 'Applied' | 'Interviewing' | 'Offered' | 'Hired';
export type EmployeeLifecycleState = 'Onboarding' | 'Active' | 'Promoted' | 'Offboarded';

export interface JobRequisition {
  id: string;
  title: string;
  department: string;
  openingsCount: number;
  status: 'Active' | 'Filled' | 'Draft';
}

export interface Candidate {
  id: string;
  name: string;
  appliedRole: string;
  stage: CandidateStage;
  matchScorePercent: number;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  roleTitle: string;
  department: string;
  skills: string[];
  performanceScore: number; // 0..100
  retentionRisk: 'Low' | 'Medium' | 'High';
  lifecycleState: EmployeeLifecycleState;
}

export interface ChroRecommendation {
  id: string;
  title: string;
  recommendation: string;
  impactEstimate: string;
  confidenceScore: number; // 0..100
  explainabilityWhy: string;
}

export interface PeopleSimulationScenario {
  id: string;
  type: 'Hiring' | 'Restructuring' | 'Compensation' | 'Expansion';
  title: string;
  projectedRetentionGain: number; // %
  riskScore: number; // 0..100
  simulationPass: boolean;
}

export interface HrAuditFinding {
  id: string;
  findingTitle: string;
  severity: 'High' | 'Medium' | 'Low';
  evidence: string;
  status: 'Open' | 'Mitigated' | 'Dismissed';
}

interface HumanCapitalState {
  headcountHuman: number;
  headcountAi: number;
  openRequisitionsCount: number;
  retentionRatePercent: number;
  engagementScorePercent: number;
  workforceHealthScore: number;

  jobRequisitions: JobRequisition[];
  candidates: Candidate[];
  employees: EmployeeProfile[];
  chroRecommendations: ChroRecommendation[];
  simulations: PeopleSimulationScenario[];
  auditFindings: HrAuditFinding[];

  // Actions
  createJobRequisition: (req: Omit<JobRequisition, 'id' | 'status'>) => void;
  advanceCandidateStage: (id: string, newStage: CandidateStage) => void;
  runPeopleSimulation: (type: PeopleSimulationScenario['type'], title: string) => PeopleSimulationScenario;
  resolveHrAuditFinding: (id: string) => void;
  updateEmployeeLifecycle: (id: string, newState: EmployeeLifecycleState) => void;
}

const DEFAULT_REQUISITIONS: JobRequisition[] = [
  { id: 'req-1', title: 'Senior Principal Rust Systems Engineer', department: 'Game Studio & Software Engineering', openingsCount: 2, status: 'Active' },
  { id: 'req-2', title: 'Senior Financial Planning & Analysis Lead', department: 'Finance & Revenue Operations', openingsCount: 1, status: 'Active' },
];

const DEFAULT_CANDIDATES: Candidate[] = [
  { id: 'cnd-101', name: 'Elena Rostova', appliedRole: 'Senior Principal Rust Systems Engineer', stage: 'Interviewing', matchScorePercent: 96 },
  { id: 'cnd-102', name: 'Marcus Vance', appliedRole: 'Senior Financial Planning & Analysis Lead', stage: 'Offered', matchScorePercent: 94 },
];

const DEFAULT_EMPLOYEES: EmployeeProfile[] = [
  { id: 'emp-1', name: 'Chief Architect Lead', roleTitle: 'VP of Software Engineering', department: 'Game Studio & Software Engineering', skills: ['Rust', 'Tauri', 'System Architecture'], performanceScore: 98, retentionRisk: 'Low', lifecycleState: 'Active' },
  { id: 'emp-2', name: 'Finance Operations Lead', roleTitle: 'Chief Financial Officer', department: 'Finance & Revenue Operations', skills: ['ERP', 'Accounting', 'Stripe Vault'], performanceScore: 96, retentionRisk: 'Low', lifecycleState: 'Active' },
];

const DEFAULT_CHRO_RECOMMENDATIONS: ChroRecommendation[] = [
  {
    id: 'chro-rec-1',
    title: 'Succession Plan for Engineering Department Head',
    recommendation: 'Promote Senior Lead Architect to Principal Fellow to establish redundant leadership continuity.',
    impactEstimate: '+12% Retention Stability',
    confidenceScore: 97,
    explainabilityWhy: 'Performance score stands at 98% with 0 retention risk and proven hybrid team management.',
  },
  {
    id: 'chro-rec-2',
    title: 'Accelerate Rust Compiler Engineer Hiring Pipeline',
    recommendation: 'Offer sign-on bonus allocation to close Senior Principal Rust Engineer requisition within 14 days.',
    impactEstimate: '35% Faster Requisition Fill',
    confidenceScore: 94,
    explainabilityWhy: 'Game Studio Pipeline throughput requires 2 additional compiler engineers to sustain Q4 milestone velocity.',
  },
];

const DEFAULT_SIMULATIONS: PeopleSimulationScenario[] = [
  { id: 'sim-peo-1', type: 'Restructuring', title: 'Matrix Department Restructuring Simulation', projectedRetentionGain: 14, riskScore: 10, simulationPass: true },
  { id: 'sim-peo-2', type: 'Compensation', title: 'Tech Talent Market Adjustment Simulation', projectedRetentionGain: 18, riskScore: 8, simulationPass: true },
];

const DEFAULT_AUDIT_FINDINGS: HrAuditFinding[] = [
  { id: 'aud-hr-1', findingTitle: 'Verified Complete Personnel Vault Records & NDA Signatures', severity: 'Low', evidence: '100% employee profiles signed and hashed in Vault.', status: 'Mitigated' },
];

export const useHumanCapitalStore = create<HumanCapitalState>((set) => ({
  headcountHuman: 42,
  headcountAi: 22,
  openRequisitionsCount: 6,
  retentionRatePercent: 96,
  engagementScorePercent: 94,
  workforceHealthScore: 97,

  jobRequisitions: DEFAULT_REQUISITIONS,
  candidates: DEFAULT_CANDIDATES,
  employees: DEFAULT_EMPLOYEES,
  chroRecommendations: DEFAULT_CHRO_RECOMMENDATIONS,
  simulations: DEFAULT_SIMULATIONS,
  auditFindings: DEFAULT_AUDIT_FINDINGS,

  createJobRequisition: (req) =>
    set((state) => ({
      jobRequisitions: [
        {
          id: `req-${Date.now()}`,
          status: 'Active',
          ...req,
        },
        ...state.jobRequisitions,
      ],
      openRequisitionsCount: state.openRequisitionsCount + req.openingsCount,
    })),

  advanceCandidateStage: (id, newStage) =>
    set((state) => ({
      candidates: state.candidates.map((c) => (c.id === id ? { ...c, stage: newStage } : c)),
    })),

  runPeopleSimulation: (type, title) => {
    const newSim: PeopleSimulationScenario = {
      id: `sim-peo-${Date.now()}`,
      type,
      title,
      projectedRetentionGain: 15,
      riskScore: 12,
      simulationPass: true,
    };

    set((state) => ({ simulations: [newSim, ...state.simulations] }));
    return newSim;
  },

  resolveHrAuditFinding: (id) =>
    set((state) => ({
      auditFindings: state.auditFindings.map((f) => (f.id === id ? { ...f, status: 'Mitigated' } : f)),
    })),

  updateEmployeeLifecycle: (id, newState) =>
    set((state) => ({
      employees: state.employees.map((e) => (e.id === id ? { ...e, lifecycleState: newState } : e)),
    })),
}));
