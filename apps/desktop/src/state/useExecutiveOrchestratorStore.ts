import { create } from 'zustand';

export type PolicyLevel = 'Manual' | 'Assisted' | 'Semi-Autonomous' | 'Autonomous';

export interface DecomposedTask {
  id: string;
  title: string;
  category: 'Objective' | 'Project' | 'Milestone' | 'Mission' | 'Task' | 'Subtask';
  assignedAgent: string;
  assignedHuman?: string;
  progress: number; // 0..100
  status: 'Queued' | 'Executing' | 'Blocked' | 'Recovering' | 'Completed';
  dependencies: string[];
}

export interface ExecutionContract {
  id: string;
  planId: string;
  title: string;
  scope: string;
  owner: string;
  resourcesAllocated: string[];
  dependenciesResolved: boolean;
  rollbackStrategy: string;
  successCriteria: string[];
  humanApprovalRequired: boolean;
  signedByHuman: boolean;
  timestamp: string;
}

export interface FailureAlert {
  id: string;
  taskId: string;
  failureType: 'Agent Timeout' | 'Connector Failure' | 'Policy Violation' | 'Dependency Blocked';
  description: string;
  recoveryStrategy: 'Retry' | 'Swap Alternative Agent' | 'Replan Execution Path' | 'Human Escalation';
  status: 'Detected' | 'Recovering' | 'Resolved';
  timestamp: string;
}

interface ExecutiveOrchestratorState {
  tasks: DecomposedTask[];
  contracts: ExecutionContract[];
  failures: FailureAlert[];

  activePolicyLevel: PolicyLevel;

  // Control Tower Metrics
  controlTowerMetrics: {
    orgHealthScore: number; // 0..100
    activeExecutionsCount: number;
    pendingApprovalsCount: number;
    blockedMissionsCount: number;
    aiCapacityUsage: number; // 0..100
  };

  // Actions
  setPolicyLevel: (policy: PolicyLevel) => void;
  signExecutionContract: (contractId: string) => void;
  triggerFailureRecovery: (alertId: string) => void;
  addDecomposedTask: (task: Omit<DecomposedTask, 'id'>) => void;
}

const DEFAULT_TASKS: DecomposedTask[] = [
  { id: 'task-101', title: 'Initialize Tokio Multithreaded Executor', category: 'Objective', assignedAgent: 'Lead Architect Agent', progress: 100, status: 'Completed', dependencies: [] },
  { id: 'task-102', title: 'Provision Game Studio Capability Pack', category: 'Mission', assignedAgent: 'Game Studio Assistant', progress: 75, status: 'Executing', dependencies: ['task-101'] },
  { id: 'task-103', title: 'Verify SQLite Vault SHA-256 Event Log Hash', category: 'Task', assignedAgent: 'QA Certification Bot', progress: 30, status: 'Executing', dependencies: ['task-101'] },
  { id: 'task-104', title: 'Rehearse Forward-Only Vault Projection Rebuild', category: 'Subtask', assignedAgent: 'Database Optimization Agent', progress: 0, status: 'Queued', dependencies: ['task-103'] },
];

const DEFAULT_CONTRACTS: ExecutionContract[] = [
  {
    id: 'cntr-2026-01',
    planId: 'scen-bal',
    title: 'Balanced Enterprise Workspace Orchestration Contract',
    scope: 'Engineering & Game Studio Spaces',
    owner: 'Chief Software Architect',
    resourcesAllocated: ['Tokio Thread Pool', 'SQLite Vault', 'Permission Broker Token Engine'],
    dependenciesResolved: true,
    rollbackStrategy: 'Revert to Live Digital Twin Snapshot snap-live',
    successCriteria: ['100% security token compliance', 'Zero cloud data leakage', 'IPC latency < 5ms'],
    humanApprovalRequired: true,
    signedByHuman: true,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

const DEFAULT_FAILURES: FailureAlert[] = [
  {
    id: 'fail-01',
    taskId: 'task-104',
    failureType: 'Agent Timeout',
    description: 'Sub-agent Database Optimization Agent did not respond within 5000ms SLA ceiling.',
    recoveryStrategy: 'Swap Alternative Agent',
    status: 'Recovering',
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
];

export const useExecutiveOrchestratorStore = create<ExecutiveOrchestratorState>((set) => ({
  tasks: DEFAULT_TASKS,
  contracts: DEFAULT_CONTRACTS,
  failures: DEFAULT_FAILURES,

  activePolicyLevel: 'Semi-Autonomous',

  controlTowerMetrics: {
    orgHealthScore: 98,
    activeExecutionsCount: 3,
    pendingApprovalsCount: 1,
    blockedMissionsCount: 0,
    aiCapacityUsage: 42,
  },

  setPolicyLevel: (policy) => set({ activePolicyLevel: policy }),

  signExecutionContract: (contractId) =>
    set((state) => ({
      contracts: state.contracts.map((c) => (c.id === contractId ? { ...c, signedByHuman: true } : c)),
    })),

  triggerFailureRecovery: (alertId) =>
    set((state) => ({
      failures: state.failures.map((f) => (f.id === alertId ? { ...f, status: 'Resolved' } : f)),
      tasks: state.tasks.map((t) => (t.status === 'Recovering' ? { ...t, status: 'Executing', progress: 40 } : t)),
    })),

  addDecomposedTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, { id: `task-${Date.now()}`, ...task }],
    })),
}));
