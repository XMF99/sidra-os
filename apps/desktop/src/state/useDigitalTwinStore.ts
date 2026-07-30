import { create } from 'zustand';

export interface DigitalTwinSnapshot {
  id: string;
  name: string;
  timestamp: string;
  nodesCount: number;
  spacesCount: number;
  capabilitiesCount: number;
  isSandboxActive: boolean;
}

export type ScenarioVariant = 'Optimistic' | 'Balanced' | 'Conservative' | 'Worst Case' | 'Best Case';

export interface ScenarioSimulation {
  id: string;
  variant: ScenarioVariant;
  completionProbability: number; // 0..100
  estimatedTimeDays: number;
  estimatedCost: string;
  riskRating: 'Low' | 'Medium' | 'High' | 'Critical';
  confidenceScore: number;
  weightedScore: number; // 0..100
}

export interface WhatIfQuery {
  id: string;
  question: string;
  projectedOutcome: string;
  riskDelta: string;
  recommendation: string;
}

export interface ResourceProposal {
  id: string;
  resourceType: 'People' | 'AI Agents' | 'Budget' | 'Time' | 'Infrastructure';
  currentBottleneck: string;
  proposedReallocation: string;
  expectedRoi: string;
}

export interface OpportunityItem {
  id: string;
  type: 'Reusable Blueprint' | 'Workflow Automation' | 'Cost Savings' | 'Cross-Team Synergy';
  title: string;
  description: string;
  estimatedImpact: string;
}

export interface ExecutionPreviewPayload {
  planId: string;
  planTitle: string;
  createdObjects: string[];
  updatedObjects: string[];
  deletedObjects: string[];
  rollbackStrategy: string;
  humanApprovalRequired: boolean;
  isApproved: boolean;
}

interface DigitalTwinState {
  snapshots: DigitalTwinSnapshot[];
  activeSnapshotId: string;

  scenarios: ScenarioSimulation[];
  whatIfQueries: WhatIfQuery[];
  resourceProposals: ResourceProposal[];
  opportunities: OpportunityItem[];

  stagedPreview: ExecutionPreviewPayload | null;

  // Actions
  createSnapshot: (name: string) => void;
  restoreSnapshot: (id: string) => void;

  runWhatIfQuery: (question: string) => WhatIfQuery;
  approveExecutionPlan: (planId: string) => void;
  stageExecutionPreview: (payload: ExecutionPreviewPayload) => void;
  clearStagedPreview: () => void;
}

const DEFAULT_SNAPSHOTS: DigitalTwinSnapshot[] = [
  { id: 'snap-live', name: 'Live Production Digital Twin Snapshot', timestamp: new Date().toISOString(), nodesCount: 142, spacesCount: 6, capabilitiesCount: 4, isSandboxActive: true },
  { id: 'snap-hist-1', name: 'Pre-E07 Optimization Snapshot', timestamp: new Date(Date.now() - 86400000).toISOString(), nodesCount: 110, spacesCount: 4, capabilitiesCount: 2, isSandboxActive: false },
];

const DEFAULT_SCENARIOS: ScenarioSimulation[] = [
  { id: 'scen-opt', variant: 'Optimistic', completionProbability: 92, estimatedTimeDays: 5, estimatedCost: '$1,200', riskRating: 'Low', confidenceScore: 94, weightedScore: 92 },
  { id: 'scen-bal', variant: 'Balanced', completionProbability: 96, estimatedTimeDays: 7, estimatedCost: '$1,500', riskRating: 'Low', confidenceScore: 98, weightedScore: 96 },
  { id: 'scen-con', variant: 'Conservative', completionProbability: 99, estimatedTimeDays: 10, estimatedCost: '$1,800', riskRating: 'Low', confidenceScore: 99, weightedScore: 90 },
  { id: 'scen-worst', variant: 'Worst Case', completionProbability: 75, estimatedTimeDays: 16, estimatedCost: '$3,400', riskRating: 'High', confidenceScore: 82, weightedScore: 65 },
  { id: 'scen-best', variant: 'Best Case', completionProbability: 88, estimatedTimeDays: 4, estimatedCost: '$950', riskRating: 'Medium', confidenceScore: 90, weightedScore: 94 },
];

const DEFAULT_WHAT_IF: WhatIfQuery[] = [
  { id: 'wif-1', question: 'What if budget is reduced by 20%?', projectedOutcome: 'Extends timeline by 2 days; zero impact on core security token compliance.', riskDelta: 'Low (+2%)', recommendation: 'De-prioritize non-essential dashboard widgets.' },
  { id: 'wif-2', question: 'What if sub-agent workforce doubles?', projectedOutcome: 'Increases task scheduling throughput to 240k ops/sec; IPC memory footprint rises +18 MB.', riskDelta: 'Low (+1%)', recommendation: 'Cap max concurrent worker threads at 16.' },
];

const DEFAULT_PROPOSALS: ResourceProposal[] = [
  { id: 'res-1', resourceType: 'AI Agents', currentBottleneck: 'Single QA Certification Bot creates PR review delays', proposedReallocation: 'Deploy 2 parallel QA Sub-Agent instances', expectedRoi: '3.4x faster certification' },
  { id: 'res-2', resourceType: 'People', currentBottleneck: 'Manual approval gate for blueprint publishing', proposedReallocation: 'Enable auto-approval for internal Space-level drafts', expectedRoi: 'Reduces wait time by 80%' },
];

const DEFAULT_OPPORTUNITIES: OpportunityItem[] = [
  { id: 'opp-1', type: 'Reusable Blueprint', title: 'Game Studio Master Blueprint', description: 'Publish verified Game Studio blueprint to Org Library for multi-team reuse.', estimatedImpact: 'Saves 4 hours per new workspace' },
  { id: 'opp-2', type: 'Workflow Automation', title: 'Automated Vault Event Compaction', description: 'Schedule background SQLite event compaction every 10k log sequences.', estimatedImpact: 'Reduces SSD disk usage by 35%' },
];

export const useDigitalTwinStore = create<DigitalTwinState>((set) => ({
  snapshots: DEFAULT_SNAPSHOTS,
  activeSnapshotId: 'snap-live',

  scenarios: DEFAULT_SCENARIOS,
  whatIfQueries: DEFAULT_WHAT_IF,
  resourceProposals: DEFAULT_PROPOSALS,
  opportunities: DEFAULT_OPPORTUNITIES,

  stagedPreview: null,

  createSnapshot: (name) =>
    set((state) => ({
      snapshots: [
        {
          id: `snap-${Date.now()}`,
          name,
          timestamp: new Date().toISOString(),
          nodesCount: 145,
          spacesCount: 6,
          capabilitiesCount: 4,
          isSandboxActive: false,
        },
        ...state.snapshots,
      ],
    })),

  restoreSnapshot: (id) => set({ activeSnapshotId: id }),

  runWhatIfQuery: (question) => {
    const newQuery: WhatIfQuery = {
      id: `wif-${Date.now()}`,
      question,
      projectedOutcome: `Simulated inside Digital Twin sandbox: Hypothetical evaluation for '${question}' completed. Zero production state mutated.`,
      riskDelta: 'Negligible (Sandbox Isolated)',
      recommendation: 'Recommended: Proceed with simulated execution plan.',
    };

    set((state) => ({ whatIfQueries: [newQuery, ...state.whatIfQueries] }));
    return newQuery;
  },

  approveExecutionPlan: (planId) =>
    set((state) => ({
      stagedPreview: state.stagedPreview && state.stagedPreview.planId === planId
        ? { ...state.stagedPreview, isApproved: true }
        : state.stagedPreview,
    })),

  stageExecutionPreview: (payload) => set({ stagedPreview: payload }),
  clearStagedPreview: () => set({ stagedPreview: null }),
}));
