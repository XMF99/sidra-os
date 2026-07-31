import { create } from 'zustand';

export type DealStage = 'Discovery' | 'Proposal' | 'Negotiation' | 'Closed Won';
export type TicketPriority = 'Critical' | 'High' | 'Normal';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';

export interface Deal {
  id: string;
  title: string;
  accountName: string;
  value: number;
  stage: DealStage;
  winProbabilityPercent: number;
}

export interface CustomerAccount {
  id: string;
  name: string;
  segment: 'Enterprise' | 'Mid-Market';
  arrValue: number;
  healthScore: number; // 0..100
  status: 'Active' | 'At Risk';
}

export interface SupportTicket {
  id: string;
  subject: string;
  customerName: string;
  priority: TicketPriority;
  status: TicketStatus;
  slaMet: boolean;
}

export interface CcoRecommendation {
  id: string;
  title: string;
  recommendation: string;
  impactEstimate: string;
  confidenceScore: number; // 0..100
  explainabilityWhy: string;
}

export interface CrmSimulationScenario {
  id: string;
  type: 'Campaign' | 'Pipeline' | 'Pricing' | 'Retention' | 'Expansion';
  title: string;
  projectedWinRateGain: number; // %
  riskScore: number; // 0..100
  simulationPass: boolean;
}

export interface CrmAuditFinding {
  id: string;
  findingTitle: string;
  severity: 'High' | 'Medium' | 'Low';
  evidence: string;
  status: 'Open' | 'Mitigated' | 'Dismissed';
}

interface CustomerIntelligenceState {
  pipelineValueArr: number; // $ in Millions
  openOpportunitiesCount: number;
  customerHealthScore: number;
  csatScorePercent: number;
  netRetentionRatePercent: number;

  deals: Deal[];
  accounts: CustomerAccount[];
  tickets: SupportTicket[];
  ccoRecommendations: CcoRecommendation[];
  simulations: CrmSimulationScenario[];
  auditFindings: CrmAuditFinding[];

  // Actions
  advanceDealStage: (id: string, newStage: DealStage) => void;
  resolveSupportTicket: (id: string) => void;
  runCrmSimulation: (type: CrmSimulationScenario['type'], title: string) => CrmSimulationScenario;
  resolveCrmAuditFinding: (id: string) => void;
}

const DEFAULT_DEALS: Deal[] = [
  { id: 'deal-1', title: 'Global Enterprise License Expansion', accountName: 'Apex Game Publishing Corp', value: 4500000, stage: 'Negotiation', winProbabilityPercent: 92 },
  { id: 'deal-2', title: 'Game Studio Pipeline Capability Rollout', accountName: 'Valence Interactive Systems', value: 2800000, stage: 'Proposal', winProbabilityPercent: 85 },
];

const DEFAULT_ACCOUNTS: CustomerAccount[] = [
  { id: 'acc-1', name: 'Apex Game Publishing Corp', segment: 'Enterprise', arrValue: 6500000, healthScore: 98, status: 'Active' },
  { id: 'acc-2', name: 'Valence Interactive Systems', segment: 'Enterprise', arrValue: 4200000, healthScore: 96, status: 'Active' },
];

const DEFAULT_TICKETS: SupportTicket[] = [
  { id: 'tkt-1', subject: 'Stripe Vault Payment Gateway Re-sync Query', customerName: 'Apex Game Publishing Corp', priority: 'High', status: 'In Progress', slaMet: true },
];

const DEFAULT_CCO_RECOMMENDATIONS: CcoRecommendation[] = [
  {
    id: 'cco-rec-1',
    title: 'Initiate VIP Expansion Campaign for Top Enterprise Accounts',
    recommendation: 'Present Game Studio Solution to Apex Publishing to expand ARR from $6.5M to $11.0M.',
    impactEstimate: '+$4.5M ARR Expansion',
    confidenceScore: 98,
    explainabilityWhy: 'CSAT stands at 98% with 100% SLA compliance and zero churn risk signals across accounts.',
  },
  {
    id: 'cco-rec-2',
    title: 'Automate Next Best Action Recommendations for At-Risk Trials',
    recommendation: 'Deploy sub-agent follow-up workflows for mid-market prospects stalling in proposal stage.',
    impactEstimate: '18% Higher Deal Conversion',
    confidenceScore: 95,
    explainabilityWhy: 'Historical conversion analysis shows sub-agent proposal assistance increases win rate to 85%.',
  },
];

const DEFAULT_SIMULATIONS: CrmSimulationScenario[] = [
  { id: 'sim-crm-1', type: 'Expansion', title: 'Enterprise Upsell Campaign Simulation', projectedWinRateGain: 18, riskScore: 8, simulationPass: true },
  { id: 'sim-crm-2', type: 'Pricing', title: 'Tiered License Optimization Simulation', projectedWinRateGain: 22, riskScore: 12, simulationPass: true },
];

const DEFAULT_AUDIT_FINDINGS: CrmAuditFinding[] = [
  { id: 'aud-crm-1', findingTitle: 'Verified SHA-256 Customer Vault Hash & SLA Compliance Integrity', severity: 'Low', evidence: '100% support tickets meet SLA thresholds with immutable audit logs.', status: 'Mitigated' },
];

export const useCustomerIntelligenceStore = create<CustomerIntelligenceState>((set) => ({
  pipelineValueArr: 18.6,
  openOpportunitiesCount: 18,
  customerHealthScore: 98,
  csatScorePercent: 96,
  netRetentionRatePercent: 124,

  deals: DEFAULT_DEALS,
  accounts: DEFAULT_ACCOUNTS,
  tickets: DEFAULT_TICKETS,
  ccoRecommendations: DEFAULT_CCO_RECOMMENDATIONS,
  simulations: DEFAULT_SIMULATIONS,
  auditFindings: DEFAULT_AUDIT_FINDINGS,

  advanceDealStage: (id, newStage) =>
    set((state) => ({
      deals: state.deals.map((d) => (d.id === id ? { ...d, stage: newStage } : d)),
    })),

  resolveSupportTicket: (id) =>
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === id ? { ...t, status: 'Resolved' } : t)),
    })),

  runCrmSimulation: (type, title) => {
    const newSim: CrmSimulationScenario = {
      id: `sim-crm-${Date.now()}`,
      type,
      title,
      projectedWinRateGain: 20,
      riskScore: 10,
      simulationPass: true,
    };

    set((state) => ({ simulations: [newSim, ...state.simulations] }));
    return newSim;
  },

  resolveCrmAuditFinding: (id) =>
    set((state) => ({
      auditFindings: state.auditFindings.map((f) => (f.id === id ? { ...f, status: 'Mitigated' } : f)),
    })),
}));
