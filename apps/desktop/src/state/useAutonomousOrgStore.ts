import { create } from 'zustand';

export type WorkerType = 'AI Executive' | 'AI Manager' | 'AI Specialist' | 'AI Operator' | 'AI Analyst' | 'AI Assistant' | 'Human Employee' | 'Human Contractor';
export type DecisionAction = 'Approve' | 'Escalate' | 'Delegate' | 'Pause' | 'Recommend';

export interface WorkforceMember {
  id: string;
  name: string;
  type: WorkerType;
  roleTitle: string;
  skills: string[];
  assignedDepartmentId: string;
  workloadPercent: number;
  status: 'Active' | 'Idle' | 'Busy';
}

export interface DepartmentRuntime {
  id: string;
  departmentName: string;
  dailyRoutineStatus: 'Executing Operations' | 'Sprint Review' | 'Planning' | 'Idle';
  activeTasksCount: number;
  completedTasksCount: number;
  healthScore: number; // 0..100
}

export interface MorningBriefing {
  id: string;
  date: string;
  summary: string;
  topRisks: string[];
  taskAssignmentsCount: number;
  aiAutonomyPercent: number;
}

export interface DecisionLogEntry {
  id: string;
  action: DecisionAction;
  targetSubject: string;
  reasoning: string;
  governancePolicy: string;
  timestamp: string;
}

interface AutonomousOrgState {
  workforce: WorkforceMember[];
  runtimes: DepartmentRuntime[];
  briefings: MorningBriefing[];
  decisionLogs: DecisionLogEntry[];

  // Actions
  triggerDailyMorningBriefing: () => MorningBriefing;
  logAutonomousDecision: (entry: Omit<DecisionLogEntry, 'id' | 'timestamp'>) => void;
  updateWorkerStatus: (id: string, status: WorkforceMember['status'], workload: number) => void;
}

const DEFAULT_WORKFORCE: WorkforceMember[] = [
  { id: 'wrk-ceo-ai', name: 'Executive Orchestration Sub-Agent', type: 'AI Executive', roleTitle: 'Chief AI Orchestrator', skills: ['Mission Decomposition', 'Resource Optimization', 'Governance'], assignedDepartmentId: 'dept-exec', workloadPercent: 65, status: 'Active' },
  { id: 'wrk-eng-head', name: 'Senior Principal Rust Architect', type: 'Human Employee', roleTitle: 'VP of Software & Game Engineering', skills: ['Rust', 'Tauri', 'Architecture'], assignedDepartmentId: 'dept-eng', workloadPercent: 80, status: 'Active' },
  { id: 'wrk-qa-bot', name: 'Playwright & Clippy QA Sub-Agent', type: 'AI Specialist', roleTitle: 'QA Certification Bot', skills: ['Vitest', 'Playwright', 'Cargo Clippy'], assignedDepartmentId: 'dept-eng', workloadPercent: 90, status: 'Busy' },
  { id: 'wrk-cfo-human', name: 'Finance Operations Lead', type: 'Human Employee', roleTitle: 'Chief Financial Officer', skills: ['ERP', 'Stripe', 'Accounting'], assignedDepartmentId: 'dept-fin', workloadPercent: 55, status: 'Active' },
  { id: 'wrk-fin-bot', name: 'Stripe Vault Reconciliation Bot', type: 'AI Operator', roleTitle: 'Stripe Accounting Sync Sub-Agent', skills: ['Vault Hashing', 'Invoice Processing'], assignedDepartmentId: 'dept-fin', workloadPercent: 40, status: 'Active' },
];

const DEFAULT_RUNTIMES: DepartmentRuntime[] = [
  { id: 'dept-exec', departmentName: 'Executive Office', dailyRoutineStatus: 'Executing Operations', activeTasksCount: 4, completedTasksCount: 38, healthScore: 98 },
  { id: 'dept-eng', departmentName: 'Game Studio & Software Engineering', dailyRoutineStatus: 'Executing Operations', activeTasksCount: 12, completedTasksCount: 142, healthScore: 96 },
  { id: 'dept-fin', departmentName: 'Finance & Revenue Operations', dailyRoutineStatus: 'Sprint Review', activeTasksCount: 5, completedTasksCount: 89, healthScore: 99 },
];

const DEFAULT_BRIEFINGS: MorningBriefing[] = [
  {
    id: 'brf-today',
    date: new Date().toISOString().split('T')[0],
    summary: 'Autonomous morning briefing complete. All 3 departments running at 98% health. Zero blocking risks detected.',
    topRisks: ['Minor latency spike in Stripe API webhook listener', 'Cargo clippy check pending on new PR draft'],
    taskAssignmentsCount: 21,
    aiAutonomyPercent: 88,
  },
];

const DEFAULT_DECISIONS: DecisionLogEntry[] = [
  {
    id: 'dec-1',
    action: 'Approve',
    targetSubject: 'Game Studio Master Pipeline v2.1.0 Deployment',
    reasoning: 'Passed 100% Vitest unit tests, Playwright E2E suite, and Cargo Clippy with 0 warnings.',
    governancePolicy: 'Immutable Execution Contract Policy v1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'dec-2',
    action: 'Delegate',
    targetSubject: 'Invoice Receipt Hash Audit',
    reasoning: 'Delegated line-item extraction to Stripe Accounting Sync Sub-Agent.',
    governancePolicy: 'Least Privilege Sub-Agent Delegation Rule',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const useAutonomousOrgStore = create<AutonomousOrgState>((set) => ({
  workforce: DEFAULT_WORKFORCE,
  runtimes: DEFAULT_RUNTIMES,
  briefings: DEFAULT_BRIEFINGS,
  decisionLogs: DEFAULT_DECISIONS,

  triggerDailyMorningBriefing: () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newBriefing: MorningBriefing = {
      id: `brf-${Date.now()}`,
      date: todayStr,
      summary: `Automated Morning Briefing for ${todayStr}. All departments operational with 90%+ AI autonomy.`,
      topRisks: ['Routine dependency check scheduled for 14:00 UTC'],
      taskAssignmentsCount: 18,
      aiAutonomyPercent: 91,
    };

    set((state) => ({ briefings: [newBriefing, ...state.briefings] }));
    return newBriefing;
  },

  logAutonomousDecision: (entry) =>
    set((state) => ({
      decisionLogs: [
        {
          id: `dec-${Date.now()}`,
          timestamp: new Date().toISOString(),
          ...entry,
        },
        ...state.decisionLogs,
      ],
    })),

  updateWorkerStatus: (id, status, workload) =>
    set((state) => ({
      workforce: state.workforce.map((w) => (w.id === id ? { ...w, status, workloadPercent: workload } : w)),
    })),
}));
