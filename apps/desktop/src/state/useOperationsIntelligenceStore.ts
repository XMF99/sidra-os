import { create } from 'zustand';

export type TaskPriority = 'Critical' | 'High' | 'Normal';
export type TaskStatus = 'Pending' | 'In Progress' | 'Done';
export type InitiativeStatus = 'Planning' | 'In Execution' | 'Completed';

export interface OperationalInitiative {
  id: string;
  title: string;
  department: string;
  progressPercent: number;
  status: InitiativeStatus;
}

export interface ExecutionTask {
  id: string;
  taskName: string;
  assignee: string;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface OperationalResource {
  id: string;
  resourceName: string;
  category: 'Human' | 'Compute GPU' | 'Asset';
  capacityUtilizationPercent: number;
}

export interface CooRecommendation {
  id: string;
  title: string;
  recommendation: string;
  impactEstimate: string;
  confidenceScore: number; // 0..100
  explainabilityWhy: string;
}

export interface OperationsSimulationScenario {
  id: string;
  type: 'Capacity' | 'Resource' | 'Schedule' | 'Expansion' | 'ScenarioAnalysis';
  title: string;
  projectedThroughputGain: number; // %
  riskScore: number; // 0..100
  simulationPass: boolean;
}

export interface OperationsAuditFinding {
  id: string;
  findingTitle: string;
  severity: 'High' | 'Medium' | 'Low';
  evidence: string;
  status: 'Open' | 'Mitigated' | 'Dismissed';
}

interface OperationsIntelligenceState {
  operationalHealthScore: number;
  executionProgressPercent: number;
  capacityUtilizationPercent: number;
  resourceEfficiencyPercent: number;
  openIncidentsCount: number;

  initiatives: OperationalInitiative[];
  tasks: ExecutionTask[];
  resources: OperationalResource[];
  cooRecommendations: CooRecommendation[];
  simulations: OperationsSimulationScenario[];
  auditFindings: OperationsAuditFinding[];

  // Actions
  completeExecutionTask: (id: string) => void;
  runOperationsSimulation: (type: OperationsSimulationScenario['type'], title: string) => OperationsSimulationScenario;
  resolveOperationsAuditFinding: (id: string) => void;
}

const DEFAULT_INITIATIVES: OperationalInitiative[] = [
  { id: 'init-1', title: 'Game Studio Pipeline Capacity Scaling', department: 'Game Studio & Engineering', progressPercent: 94, status: 'In Execution' },
  { id: 'init-2', title: 'Automated Multi-Region Infrastructure Deployment', department: 'Cloud Infrastructure & Ops', progressPercent: 88, status: 'In Execution' },
];

const DEFAULT_TASKS: ExecutionTask[] = [
  { id: 'tsk-1', taskName: 'Deploy GPU Cluster Pre-compiler Cache Nodes', assignee: 'Infrastructure AI Agent', priority: 'High', status: 'In Progress' },
  { id: 'tsk-2', taskName: 'Audit Cross-Suite Workflow Event Traceability', assignee: 'Compliance Auditor Sub-Agent', priority: 'Normal', status: 'In Progress' },
];

const DEFAULT_RESOURCES: OperationalResource[] = [
  { id: 'res-1', resourceName: 'H100 GPU Compute Cluster Node A', category: 'Compute GPU', capacityUtilizationPercent: 88 },
  { id: 'res-2', resourceName: 'Senior Rust System Engineering Staff', category: 'Human', capacityUtilizationPercent: 84 },
];

const DEFAULT_COO_RECOMMENDATIONS: CooRecommendation[] = [
  {
    id: 'coo-rec-1',
    title: 'Automate Pre-compiler Cache Invalidation across Builds',
    recommendation: 'Enable automatic sccache cache warming to reduce build cycle time by 42 seconds per commit.',
    impactEstimate: '+14% Throughput Velocity',
    confidenceScore: 99,
    explainabilityWhy: 'Compiler logs demonstrate 0 cache invalidation conflicts across 200+ consecutive automated runs.',
  },
  {
    id: 'coo-rec-2',
    title: 'Re-assign Compute Capacity to Game Studio Pipeline',
    recommendation: 'Temporarily shift 15% idle batch compute capacity to Game Studio asset rendering during off-peak hours.',
    impactEstimate: '32% Faster Asset Rendering',
    confidenceScore: 96,
    explainabilityWhy: 'Capacity utilization drops to 45% between 02:00 and 06:00, making off-peak rendering optimal.',
  },
];

const DEFAULT_SIMULATIONS: OperationsSimulationScenario[] = [
  { id: 'sim-ops-1', type: 'Capacity', title: 'Global Multi-Region Compute Capacity Simulation', projectedThroughputGain: 28, riskScore: 8, simulationPass: true },
  { id: 'sim-ops-2', type: 'Schedule', title: 'Automated Continuous Deployment Schedule Simulation', projectedThroughputGain: 34, riskScore: 10, simulationPass: true },
];

const DEFAULT_AUDIT_FINDINGS: OperationsAuditFinding[] = [
  { id: 'aud-ops-1', findingTitle: 'Verified SHA-256 Event Traceability on All Workflow Triggers', severity: 'Low', evidence: '100% operational workflow executions logged with verified cryptographic hashes in Vault.', status: 'Mitigated' },
];

export const useOperationsIntelligenceStore = create<OperationsIntelligenceState>((set) => ({
  operationalHealthScore: 99,
  executionProgressPercent: 94,
  capacityUtilizationPercent: 88,
  resourceEfficiencyPercent: 96,
  openIncidentsCount: 0,

  initiatives: DEFAULT_INITIATIVES,
  tasks: DEFAULT_TASKS,
  resources: DEFAULT_RESOURCES,
  cooRecommendations: DEFAULT_COO_RECOMMENDATIONS,
  simulations: DEFAULT_SIMULATIONS,
  auditFindings: DEFAULT_AUDIT_FINDINGS,

  completeExecutionTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status: 'Done' } : t)),
    })),

  runOperationsSimulation: (type, title) => {
    const newSim: OperationsSimulationScenario = {
      id: `sim-ops-${Date.now()}`,
      type,
      title,
      projectedThroughputGain: 30,
      riskScore: 9,
      simulationPass: true,
    };

    set((state) => ({ simulations: [newSim, ...state.simulations] }));
    return newSim;
  },

  resolveOperationsAuditFinding: (id) =>
    set((state) => ({
      auditFindings: state.auditFindings.map((f) => (f.id === id ? { ...f, status: 'Mitigated' } : f)),
    })),
}));
