import { create } from 'zustand';

export interface BoardMemberAdvisor {
  id: string;
  role: 'CEO' | 'COO' | 'CFO' | 'CTO' | 'CMO' | 'CHRO' | 'General Counsel';
  name: string;
  focusArea: string;
  currentRecommendation: string;
  confidenceScore: number; // 0..100
}

export interface WarRoomIncident {
  id: string;
  incidentTitle: string;
  severity: 'Critical' | 'High' | 'Moderate';
  affectedDepartment: string;
  digitalTwinScenarioId: string;
  recommendedAction: string;
  status: 'Active' | 'Mitigating' | 'Resolved';
}

export interface ExecutiveDecision {
  id: string;
  title: string;
  impactScope: string;
  approvalStatus: 'Pending' | 'Approved' | 'Escalated' | 'Rejected';
  executionContractId: string;
  explainability: {
    why: string;
    evidence: string;
    confidence: number;
    alternatives: string[];
  };
  submittedAt: string;
}

export interface FinancialSnapshot {
  revenueArr: number; // $ in Millions
  expensesArr: number;
  cashRunwayMonths: number;
  grossMarginPercent: number;
  budgetAdherencePercent: number;
}

export interface RiskRadarItem {
  id: string;
  category: 'Strategic' | 'Operational' | 'Financial' | 'Security' | 'Compliance' | 'AI';
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  likelihoodPercent: number;
  mitigationPlan: string;
}

export interface ExecutiveMemoryEntry {
  id: string;
  title: string;
  category: 'Decision' | 'Meeting Summary' | 'Strategic Milestone' | 'Lesson Learned';
  content: string;
  timestamp: string;
}

interface ExecutiveSuiteState {
  financials: FinancialSnapshot;
  boardAdvisors: BoardMemberAdvisor[];
  warRoomIncidents: WarRoomIncident[];
  pendingDecisions: ExecutiveDecision[];
  riskRadar: RiskRadarItem[];
  executiveMemory: ExecutiveMemoryEntry[];

  searchQuery: string;

  // Actions
  setSearchQuery: (query: string) => void;
  approveExecutiveDecision: (id: string) => void;
  resolveWarRoomIncident: (id: string) => void;
  addExecutiveMemoryNote: (title: string, category: ExecutiveMemoryEntry['category'], content: string) => void;
}

const DEFAULT_FINANCIALS: FinancialSnapshot = {
  revenueArr: 12.4,
  expensesArr: 8.1,
  cashRunwayMonths: 28,
  grossMarginPercent: 78,
  budgetAdherencePercent: 96,
};

const DEFAULT_BOARD_ADVISORS: BoardMemberAdvisor[] = [
  { id: 'adv-ceo', role: 'CEO', name: 'Chief AI Strategic Advisor', focusArea: 'Enterprise Growth & Vision', currentRecommendation: 'Expand Game Studio Pipeline capability to international publishing spaces.', confidenceScore: 96 },
  { id: 'adv-coo', role: 'COO', name: 'Operations Excellence Advisor', focusArea: 'Department Throughput & Delivery', currentRecommendation: 'Automate weekly sprint reviews across Engineering and Marketing.', confidenceScore: 94 },
  { id: 'adv-cfo', role: 'CFO', name: 'Financial Intelligence Advisor', focusArea: 'Cash Runway & Margins', currentRecommendation: 'Reallocate $150k unassigned budget into AI sub-agent infrastructure.', confidenceScore: 98 },
  { id: 'adv-cto', role: 'CTO', name: 'Technology & AI Platform Advisor', focusArea: 'System Architecture & Security', currentRecommendation: 'Enforce SHA-256 Event Vault Lock across all new workspace blueprints.', confidenceScore: 99 },
  { id: 'adv-cmo', role: 'CMO', name: 'Market Intelligence Advisor', focusArea: 'Brand & Customer Growth', currentRecommendation: 'Launch omni-channel campaign for Sidra OS enterprise capabilities.', confidenceScore: 91 },
  { id: 'adv-chro', role: 'CHRO', name: 'Workforce & Talent Advisor', focusArea: 'Hybrid Human-AI Team Health', currentRecommendation: 'Optimize AI sub-agent workload capacity to maintain 98% health score.', confidenceScore: 95 },
  { id: 'adv-gc', role: 'General Counsel', name: 'Legal & Governance Advisor', focusArea: 'Regulatory Compliance & Contracts', currentRecommendation: 'Audit digital signatures on all active space contracts before production execution.', confidenceScore: 100 },
];

const DEFAULT_INCIDENTS: WarRoomIncident[] = [
  {
    id: 'inc-1',
    incidentTitle: 'Stripe Webhook Listener Re-Sync Delay',
    severity: 'Moderate',
    affectedDepartment: 'Finance & Revenue Operations',
    digitalTwinScenarioId: 'sim-stripe-retry',
    recommendedAction: 'Execute automated retry queue inside Digital Twin Sandbox prior to production flush.',
    status: 'Mitigating',
  },
];

const DEFAULT_DECISIONS: ExecutiveDecision[] = [
  {
    id: 'dec-exe-1',
    title: 'Approve Game Studio Enterprise Solution Deployment',
    impactScope: 'Engineering, Art, QA & Revenue Operations',
    approvalStatus: 'Pending',
    executionContractId: 'contract-gamedev-v2',
    explainability: {
      why: 'Unites 4 capabilities, increases automation to 88%, and saves 32 hours/week.',
      evidence: '100% Vitest tests passed, 0 Clippy warnings, Digital Twin zero mutation pass.',
      confidence: 99,
      alternatives: ['Manual deployment (higher risk)', 'Phased 2-stage rollout'],
    },
    submittedAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

const DEFAULT_RISKS: RiskRadarItem[] = [
  { id: 'rsk-1', category: 'Operational', title: 'Cargo Build Latency Spike', severity: 'Low', likelihoodPercent: 15, mitigationPlan: 'Enable sccache compiler cache in Rust toolchain.' },
  { id: 'rsk-2', category: 'Security', title: 'Unsigned Contract Execution Attempt', severity: 'High', likelihoodPercent: 5, mitigationPlan: 'Enforce digital signature verification gate.' },
];

const DEFAULT_MEMORY: ExecutiveMemoryEntry[] = [
  {
    id: 'mem-1',
    title: 'Q2 Strategic Alignment & Architecture Freeze',
    category: 'Strategic Milestone',
    content: 'Certified Programs E00 through E08.F. Achieved 100/100 readiness score and official Architecture Freeze.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const useExecutiveSuiteStore = create<ExecutiveSuiteState>((set) => ({
  financials: DEFAULT_FINANCIALS,
  boardAdvisors: DEFAULT_BOARD_ADVISORS,
  warRoomIncidents: DEFAULT_INCIDENTS,
  pendingDecisions: DEFAULT_DECISIONS,
  riskRadar: DEFAULT_RISKS,
  executiveMemory: DEFAULT_MEMORY,

  searchQuery: '',

  setSearchQuery: (query) => set({ searchQuery: query }),

  approveExecutiveDecision: (id) =>
    set((state) => ({
      pendingDecisions: state.pendingDecisions.map((d) => (d.id === id ? { ...d, approvalStatus: 'Approved' } : d)),
    })),

  resolveWarRoomIncident: (id) =>
    set((state) => ({
      warRoomIncidents: state.warRoomIncidents.map((inc) => (inc.id === id ? { ...inc, status: 'Resolved' } : inc)),
    })),

  addExecutiveMemoryNote: (title, category, content) =>
    set((state) => ({
      executiveMemory: [
        {
          id: `mem-${Date.now()}`,
          title,
          category,
          content,
          timestamp: new Date().toISOString(),
        },
        ...state.executiveMemory,
      ],
    })),
}));
