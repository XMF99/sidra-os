import { create } from 'zustand';

export type CognitiveMode =
  | 'Analytical'
  | 'Strategic'
  | 'Creative'
  | 'Operational'
  | 'Review'
  | 'Research'
  | 'Teaching'
  | 'Negotiation';

export type CognitiveProfileType =
  | 'Startup'
  | 'Enterprise'
  | 'Government'
  | 'Healthcare'
  | 'Education'
  | 'Game Studio'
  | 'Technology'
  | 'Manufacturing';

export interface PerspectiveView {
  role: 'CEO' | 'CTO' | 'CFO' | 'Security' | 'Operations' | 'HR' | 'Legal';
  viewpoint: string;
  recommendation: string;
  confidence: number;
}

export interface AssumptionItem {
  id: string;
  statement: string;
  source: string;
  evidenceRating: 'Strong' | 'Moderate' | 'Weak';
  confidence: number;
  impactLevel: 'High' | 'Medium' | 'Low';
}

export interface ReflectionRecord {
  id: string;
  actionTitle: string;
  expectedOutcome: string;
  actualOutcome: string;
  success: boolean;
  lessonsLearned: string;
  timestamp: string;
}

export interface MetaReasoningAudit {
  logicConsistencyScore: number; // 0..100
  evidenceCoverageScore: number; // 0..100
  weakAssumptionsDetected: string[];
  rejectedContradictions: string[];
  recommendedAdjustments: string;
}

interface CognitiveEngineState {
  activeMode: CognitiveMode;
  manualOverride: boolean;
  strategyWeights: { mode: CognitiveMode; weight: number }[];
  profile: CognitiveProfileType;

  perspectives: PerspectiveView[];
  assumptions: AssumptionItem[];
  reflections: ReflectionRecord[];
  metaAudit: MetaReasoningAudit;

  // Uncertainty & Goal Alignment Metrics
  uncertainty: {
    unknownFactsCount: number;
    missingDataAlerts: string[];
    confidenceRating: number;
  };
  goalAlignmentScore: number; // 0..100

  // Actions
  setActiveMode: (mode: CognitiveMode, manual?: boolean) => void;
  setProfile: (profile: CognitiveProfileType) => void;
  addAssumption: (item: Omit<AssumptionItem, 'id'>) => void;
  recordReflection: (reflection: Omit<ReflectionRecord, 'id' | 'timestamp'>) => void;
  runMetaReasoningAudit: () => MetaReasoningAudit;
}

const DEFAULT_STRATEGY_WEIGHTS: { mode: CognitiveMode; weight: number }[] = [
  { mode: 'Strategic', weight: 70 },
  { mode: 'Analytical', weight: 20 },
  { mode: 'Creative', weight: 10 },
];

const DEFAULT_PERSPECTIVES: PerspectiveView[] = [
  { role: 'CEO', viewpoint: 'Strategic alignment with long-term market expansion and customer retention.', recommendation: 'Proceed with modular capability packs.', confidence: 96 },
  { role: 'CTO', viewpoint: 'Technical architecture robustness, Tokio runtime throughput, and IPC latency.', recommendation: 'Ensure async memory boundaries are isolated.', confidence: 98 },
  { role: 'CFO', viewpoint: 'Token budget ceiling and local hardware resource efficiency.', recommendation: 'Cap background sub-agent execution threads.', confidence: 94 },
  { role: 'Security', viewpoint: 'Vault SHA-256 hash verifications and Permission Broker egress rules.', recommendation: 'Enforce 100% token validation before API egress.', confidence: 100 },
];

const DEFAULT_ASSUMPTIONS: AssumptionItem[] = [
  { id: 'asm-1', statement: 'Vault event sequencing scales linearly up to 1M events.', source: 'Performance Benchmark Benchmark-04', evidenceRating: 'Strong', confidence: 95, impactLevel: 'High' },
  { id: 'asm-2', statement: 'Multi-agent IPC messaging latency remains under 5ms.', source: 'Tokio Memory Channel Profile', evidenceRating: 'Strong', confidence: 98, impactLevel: 'Medium' },
];

const DEFAULT_REFLECTIONS: ReflectionRecord[] = [
  { id: 'refl-1', actionTitle: 'Provision Game Studio Pack', expectedOutcome: 'Full asset rendering pipeline active within 10s', actualOutcome: 'Active in 7.6s', success: true, lessonsLearned: 'Lazy graph loading reduced initial bundle init time by 24%.', timestamp: new Date(Date.now() - 3600000).toISOString() },
];

const DEFAULT_META_AUDIT: MetaReasoningAudit = {
  logicConsistencyScore: 98,
  evidenceCoverageScore: 95,
  weakAssumptionsDetected: ['Assumption asm-1 relies on local SSD throughput exceeding 500 MB/s.'],
  rejectedContradictions: ['Rejected proposal to bypass token validation for local sidecars.'],
  recommendedAdjustments: 'Increase analytical reasoning weight when processing complex mathematical models.',
};

export const useCognitiveEngineStore = create<CognitiveEngineState>((set, get) => ({
  activeMode: 'Strategic',
  manualOverride: false,
  strategyWeights: DEFAULT_STRATEGY_WEIGHTS,
  profile: 'Enterprise',

  perspectives: DEFAULT_PERSPECTIVES,
  assumptions: DEFAULT_ASSUMPTIONS,
  reflections: DEFAULT_REFLECTIONS,
  metaAudit: DEFAULT_META_AUDIT,

  uncertainty: {
    unknownFactsCount: 0,
    missingDataAlerts: [],
    confidenceRating: 98,
  },
  goalAlignmentScore: 99,

  setActiveMode: (mode, manual = false) =>
    set({ activeMode: mode, manualOverride: manual }),

  setProfile: (profile) => set({ profile }),

  addAssumption: (item) =>
    set((state) => ({
      assumptions: [
        { id: `asm-${Date.now()}`, ...item },
        ...state.assumptions,
      ],
    })),

  recordReflection: (reflection) =>
    set((state) => ({
      reflections: [
        { id: `refl-${Date.now()}`, timestamp: new Date().toISOString(), ...reflection },
        ...state.reflections,
      ],
    })),

  runMetaReasoningAudit: () => {
    const state = get();
    return state.metaAudit;
  },
}));
