import { create } from 'zustand';

export interface OrgDnaProfile {
  orgName: string;
  industry: string;
  growthStage: 'Seed' | 'Growth' | 'Enterprise' | 'Sovereign';
  riskTolerance: 'Conservative' | 'Balanced' | 'Aggressive';
  approvalStyle: 'Strict Formal' | 'Consensus' | 'Autonomous';
  communicationStyle: 'Executive Concise' | 'Detailed Technical';
  learnedPreferences: string[];
}

export interface MemoryRecord {
  id: string;
  category: 'Project' | 'Decision' | 'Approval' | 'Rejected Alternative' | 'Lesson Learned' | 'Historical Outcome';
  title: string;
  summary: string;
  timestamp: string;
  tags: string[];
  impactLevel: 'High' | 'Medium' | 'Low';
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'Space' | 'Project' | 'Agent' | 'Capability' | 'Blueprint' | 'Decision' | 'Person';
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
}

export interface DecisionRecord {
  id: string;
  title: string;
  intent: string;
  reason: string;
  alternativesEvaluated: string[];
  confidenceScore: number; // 0..100
  riskMatrix: { risk: string; severity: 'Low' | 'Medium' | 'High' }[];
  result: 'Success' | 'Pending' | 'Rolled Back';
  timestamp: string;
}

export interface ExplainabilityPayload {
  itemId: string;
  title: string;
  whyChosen: string;
  whyNotAlternatives: string[];
  howExecuted: string;
  expectedBenefits: string[];
  potentialRisks: string[];
  dependencies: string[];
  confidenceScore: number;
}

interface IntelligenceCoreState {
  dna: OrgDnaProfile;
  memories: MemoryRecord[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  decisions: DecisionRecord[];

  // Active Explainability Drawer
  activeExplanation: ExplainabilityPayload | null;
  openExplainability: (payload: ExplainabilityPayload) => void;
  closeExplainability: () => void;

  // Reasoning Layer Pipeline
  runReasoningPipeline: (query: string) => {
    intent: string;
    dnaMatch: boolean;
    memoryMatches: MemoryRecord[];
    graphNeighbors: GraphNode[];
    decisionPlan: string;
    confidence: number;
  };

  // Actions
  addMemoryRecord: (record: Omit<MemoryRecord, 'id' | 'timestamp'>) => void;
  recordDecision: (decision: Omit<DecisionRecord, 'id' | 'timestamp'>) => void;
  updateGovernanceSettings: (settings: Partial<OrgDnaProfile>) => void;
}

const DEFAULT_DNA: OrgDnaProfile = {
  orgName: 'Sidra Sovereign Enterprise',
  industry: 'Software & Autonomous Operating Systems',
  growthStage: 'Enterprise',
  riskTolerance: 'Balanced',
  approvalStyle: 'Strict Formal',
  communicationStyle: 'Executive Concise',
  learnedPreferences: [
    'Enforce 100% Permission Broker token compliance before API egress',
    'Prefer Rust Tokio async executors for low-latency tasks',
    'Iso-lock memory scopes between Marketing and Finance Spaces',
  ],
};

const DEFAULT_MEMORIES: MemoryRecord[] = [
  { id: 'mem-1', category: 'Decision', title: 'Adopted Tokio Multithreaded Executor', summary: 'Selected Tokio runtime over async-std due to 120k ops/sec task throughput.', timestamp: new Date(Date.now() - 86400000).toISOString(), tags: ['Rust', 'Architecture', 'Tokio'], impactLevel: 'High' },
  { id: 'mem-2', category: 'Rejected Alternative', title: 'Rejected Cloud SaaS Analytics Connector', summary: 'Rejected third-party analytics due to zero cloud data leakage constraint.', timestamp: new Date(Date.now() - 43200000).toISOString(), tags: ['Privacy', 'Sovereignty', 'Security'], impactLevel: 'High' },
  { id: 'mem-3', category: 'Lesson Learned', title: 'SQLite Forward Projection Rebuild Benchmark', summary: 'Rebuilding Vault forward projection takes 85ms for 10k event sequences.', timestamp: new Date(Date.now() - 21600000).toISOString(), tags: ['Vault', 'SQLite', 'Performance'], impactLevel: 'Medium' },
];

const DEFAULT_NODES: GraphNode[] = [
  { id: 'n-space-eng', label: 'Engineering Space', type: 'Space' },
  { id: 'n-space-fin', label: 'Finance Space', type: 'Space' },
  { id: 'n-prj-kernel', label: 'Sidra Kernel Optimization', type: 'Project' },
  { id: 'n-ag-planner', label: 'Executive Task Planner Agent', type: 'Agent' },
  { id: 'n-cap-devconsole', label: 'Developer Telemetry Console', type: 'Capability' },
  { id: 'n-bp-sovereign', label: 'Sovereign Enterprise Blueprint', type: 'Blueprint' },
];

const DEFAULT_EDGES: GraphEdge[] = [
  { source: 'n-space-eng', target: 'n-prj-kernel', relation: 'Owns Project' },
  { source: 'n-prj-kernel', target: 'n-ag-planner', relation: 'Uses Agent' },
  { source: 'n-space-eng', target: 'n-cap-devconsole', relation: 'Has Capability' },
  { source: 'n-bp-sovereign', target: 'n-space-eng', relation: 'Provisions Space' },
];

const DEFAULT_DECISIONS: DecisionRecord[] = [
  {
    id: 'dec-101',
    title: 'Provision Game Studio Capability Pack',
    intent: 'Expand creative asset pipeline capabilities',
    reason: 'Matches industry workspace requirement for multi-agent asset rendering.',
    alternativesEvaluated: ['Manual Asset Import', 'Generic Media Pack'],
    confidenceScore: 98,
    riskMatrix: [{ risk: 'Storage Footprint (140 MB)', severity: 'Low' }],
    result: 'Success',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'dec-102',
    title: 'Enforce Isolated Memory Scope for Marketing AI',
    intent: 'Strict team context isolation',
    reason: 'Prevents leakage of financial audit records to marketing sub-agents.',
    alternativesEvaluated: ['Shared Global Context'],
    confidenceScore: 100,
    riskMatrix: [{ risk: 'Cross-Department Communication Overhead', severity: 'Low' }],
    result: 'Success',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const useIntelligenceCoreStore = create<IntelligenceCoreState>((set, get) => ({
  dna: DEFAULT_DNA,
  memories: DEFAULT_MEMORIES,
  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  decisions: DEFAULT_DECISIONS,

  activeExplanation: null,
  openExplainability: (payload) => set({ activeExplanation: payload }),
  closeExplainability: () => set({ activeExplanation: null }),

  runReasoningPipeline: (query) => {
    const state = get();
    const qLower = query.toLowerCase();

    const matchedMemories = state.memories.filter((m) =>
      m.title.toLowerCase().includes(qLower) || m.tags.some((t) => t.toLowerCase().includes(qLower))
    );

    const matchedNodes = state.nodes.filter((n) => n.label.toLowerCase().includes(qLower));

    return {
      intent: qLower.includes('create') ? 'Create' : qLower.includes('generate') ? 'Generate' : 'Analyze',
      dnaMatch: true,
      memoryMatches: matchedMemories.length > 0 ? matchedMemories : [state.memories[0]],
      graphNeighbors: matchedNodes.length > 0 ? matchedNodes : [state.nodes[0]],
      decisionPlan: `Plan: Execute request '${query}' evaluated against ${state.dna.orgName} DNA policies and memory context.`,
      confidence: 96,
    };
  },

  addMemoryRecord: (record) =>
    set((state) => ({
      memories: [
        {
          id: `mem-${Date.now()}`,
          timestamp: new Date().toISOString(),
          ...record,
        },
        ...state.memories,
      ],
    })),

  recordDecision: (decision) =>
    set((state) => ({
      decisions: [
        {
          id: `dec-${Date.now()}`,
          timestamp: new Date().toISOString(),
          ...decision,
        },
        ...state.decisions,
      ],
    })),

  updateGovernanceSettings: (settings) =>
    set((state) => ({
      dna: { ...state.dna, ...settings },
    })),
}));
