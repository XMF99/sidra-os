import { create } from 'zustand';

export type OpportunityStage = 'Qualification' | 'Value Proposition' | 'Proposal & Quote' | 'Closed Won';
export type QuoteStatus = 'Draft' | 'Approved' | 'Signed';
export type ContractStatus = 'Active' | 'Renewal Due' | 'Expired';

export interface Opportunity {
  id: string;
  title: string;
  accountName: string;
  expectedRevenue: number;
  stage: OpportunityStage;
  closeDate: string;
}

export interface Quote {
  id: string;
  opportunityId: string;
  quoteNumber: string;
  totalAmount: number;
  discountPercent: number;
  approvalStatus: QuoteStatus;
}

export interface SalesContract {
  id: string;
  contractName: string;
  value: number;
  effectiveDate: string;
  renewalDate: string;
  status: ContractStatus;
}

export interface CroRecommendation {
  id: string;
  title: string;
  recommendation: string;
  impactEstimate: string;
  confidenceScore: number; // 0..100
  explainabilityWhy: string;
}

export interface RevenueSimulationScenario {
  id: string;
  type: 'Pricing' | 'Territory' | 'Quota' | 'Expansion' | 'Revenue';
  title: string;
  projectedRevenueGain: number; // %
  riskScore: number; // 0..100
  simulationPass: boolean;
}

export interface RevenueAuditFinding {
  id: string;
  findingTitle: string;
  severity: 'High' | 'Medium' | 'Low';
  evidence: string;
  status: 'Open' | 'Mitigated' | 'Dismissed';
}

interface SalesRevenueState {
  pipelineValueArr: number; // $ in Millions
  bookingsArr: number;
  forecastAccuracyPercent: number;
  quotaAttainmentPercent: number;
  conversionRatePercent: number;
  revenueHealthScore: number;

  opportunities: Opportunity[];
  quotes: Quote[];
  contracts: SalesContract[];
  croRecommendations: CroRecommendation[];
  simulations: RevenueSimulationScenario[];
  auditFindings: RevenueAuditFinding[];

  // Actions
  advanceOpportunityStage: (id: string, newStage: OpportunityStage) => void;
  approveQuote: (id: string) => void;
  runRevenueSimulation: (type: RevenueSimulationScenario['type'], title: string) => RevenueSimulationScenario;
  resolveRevenueAuditFinding: (id: string) => void;
}

const DEFAULT_OPPORTUNITIES: Opportunity[] = [
  { id: 'opp-1', title: 'Global Enterprise AI Platform License', accountName: 'Apex Game Publishing Corp', expectedRevenue: 5400000, stage: 'Proposal & Quote', closeDate: '2026-08-30' },
  { id: 'opp-2', title: 'Game Studio Pipeline Capacity Multiplier', accountName: 'Valence Interactive Systems', expectedRevenue: 3200000, stage: 'Qualification', closeDate: '2026-09-15' },
];

const DEFAULT_QUOTES: Quote[] = [
  { id: 'qte-101', opportunityId: 'opp-1', quoteNumber: 'Q-2026-0881', totalAmount: 5400000, discountPercent: 5, approvalStatus: 'Approved' },
];

const DEFAULT_CONTRACTS: SalesContract[] = [
  { id: 'ctr-101', contractName: 'Apex Master Enterprise Software Agreement', value: 12400000, effectiveDate: '2025-08-01', renewalDate: '2026-08-01', status: 'Renewal Due' },
];

const DEFAULT_CRO_RECOMMENDATIONS: CroRecommendation[] = [
  {
    id: 'cro-rec-1',
    title: 'Cap Discount Threshold at 5% for Q3 Enterprise Quotes',
    recommendation: 'Enforce automatic VP approval on quotes with >5% discount to preserve 78% gross margin target.',
    impactEstimate: '+$1.8M ARR Protection',
    confidenceScore: 98,
    explainabilityWhy: 'Win rates remain constant at 42% regardless of discount level when backed by Digital Twin proof.',
  },
  {
    id: 'cro-rec-2',
    title: 'Territory Re-alignment for EU Game Studio Market',
    recommendation: 'Re-assign 3 strategic accounts to Senior EMEA Enterprise Reps to accelerate 24-day sales velocity.',
    impactEstimate: '22% Faster Sales Velocity',
    confidenceScore: 96,
    explainabilityWhy: 'EMEA regional pipelines demonstrate 1.4x higher conversion when handled by specialized reps.',
  },
];

const DEFAULT_SIMULATIONS: RevenueSimulationScenario[] = [
  { id: 'sim-rev-1', type: 'Pricing', title: 'Tiered Enterprise License Pricing Simulation', projectedRevenueGain: 24, riskScore: 10, simulationPass: true },
  { id: 'sim-rev-2', type: 'Territory', title: 'Global APAC Territory Expansion Simulation', projectedRevenueGain: 30, riskScore: 14, simulationPass: true },
];

const DEFAULT_AUDIT_FINDINGS: RevenueAuditFinding[] = [
  { id: 'aud-rev-1', findingTitle: 'Verified SHA-256 Contract Signature & Discount Approval Hash', severity: 'Low', evidence: '100% contracts and quotes backed by immutable Vault signature logs.', status: 'Mitigated' },
];

export const useSalesRevenueStore = create<SalesRevenueState>((set) => ({
  pipelineValueArr: 24.8,
  bookingsArr: 12.4,
  forecastAccuracyPercent: 97,
  quotaAttainmentPercent: 114,
  conversionRatePercent: 42,
  revenueHealthScore: 99,

  opportunities: DEFAULT_OPPORTUNITIES,
  quotes: DEFAULT_QUOTES,
  contracts: DEFAULT_CONTRACTS,
  croRecommendations: DEFAULT_CRO_RECOMMENDATIONS,
  simulations: DEFAULT_SIMULATIONS,
  auditFindings: DEFAULT_AUDIT_FINDINGS,

  advanceOpportunityStage: (id, newStage) =>
    set((state) => ({
      opportunities: state.opportunities.map((o) => (o.id === id ? { ...o, stage: newStage } : o)),
    })),

  approveQuote: (id) =>
    set((state) => ({
      quotes: state.quotes.map((q) => (q.id === id ? { ...q, approvalStatus: 'Approved' } : q)),
    })),

  runRevenueSimulation: (type, title) => {
    const newSim: RevenueSimulationScenario = {
      id: `sim-rev-${Date.now()}`,
      type,
      title,
      projectedRevenueGain: 25,
      riskScore: 12,
      simulationPass: true,
    };

    set((state) => ({ simulations: [newSim, ...state.simulations] }));
    return newSim;
  },

  resolveRevenueAuditFinding: (id) =>
    set((state) => ({
      auditFindings: state.auditFindings.map((f) => (f.id === id ? { ...f, status: 'Mitigated' } : f)),
    })),
}));
