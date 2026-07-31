import { create } from 'zustand';

export type MarketingChannel = 'SEO' | 'SEM' | 'Social' | 'Email' | 'Events';
export type CampaignStatus = 'Planning' | 'Active' | 'Completed';

export interface Campaign {
  id: string;
  title: string;
  channel: MarketingChannel;
  budget: number;
  spent: number;
  leadsGenerated: number;
  roasMultiplier: number;
  status: CampaignStatus;
}

export interface AudienceSegment {
  id: string;
  name: string;
  targetPersona: string;
  leadCount: number;
  engagementScore: number; // 0..100
}

export interface CmoRecommendation {
  id: string;
  title: string;
  recommendation: string;
  impactEstimate: string;
  confidenceScore: number; // 0..100
  explainabilityWhy: string;
}

export interface MarketingSimulationScenario {
  id: string;
  type: 'Campaign' | 'Budget' | 'Audience' | 'PricingImpact' | 'Growth';
  title: string;
  projectedRoasGain: number; // e.g. 1.8x
  riskScore: number; // 0..100
  simulationPass: boolean;
}

export interface MarketingAuditFinding {
  id: string;
  findingTitle: string;
  severity: 'High' | 'Medium' | 'Low';
  evidence: string;
  status: 'Open' | 'Mitigated' | 'Dismissed';
}

interface MarketingGrowthState {
  qualifiedLeadsCount: number;
  cacAmount: number; // $
  roasMultiplier: number;
  marketingRoiPercent: number;
  marketingHealthScore: number;

  campaigns: Campaign[];
  segments: AudienceSegment[];
  cmoRecommendations: CmoRecommendation[];
  simulations: MarketingSimulationScenario[];
  auditFindings: MarketingAuditFinding[];

  // Actions
  updateCampaignStatus: (id: string, newStatus: CampaignStatus) => void;
  runMarketingSimulation: (type: MarketingSimulationScenario['type'], title: string) => MarketingSimulationScenario;
  resolveMarketingAuditFinding: (id: string) => void;
}

const DEFAULT_CAMPAIGNS: Campaign[] = [
  { id: 'cmp-1', title: 'Global Enterprise Sidra OS Launch Campaign', channel: 'SEM', budget: 150000, spent: 82000, leadsGenerated: 680, roasMultiplier: 4.8, status: 'Active' },
  { id: 'cmp-2', title: 'Game Studio Capability Developer Outreach', channel: 'Social', budget: 75000, spent: 41000, leadsGenerated: 340, roasMultiplier: 3.9, status: 'Active' },
];

const DEFAULT_SEGMENTS: AudienceSegment[] = [
  { id: 'seg-1', name: 'Enterprise CTOs & Software Architects', targetPersona: 'Technical Executives', leadCount: 820, engagementScore: 94 },
  { id: 'seg-2', name: 'Game Studio Directors & Asset Managers', targetPersona: 'Creative Directors', leadCount: 420, engagementScore: 91 },
];

const DEFAULT_CMO_RECOMMENDATIONS: CmoRecommendation[] = [
  {
    id: 'cmo-rec-1',
    title: 'Re-allocate $40k Search Budget into High-ROAS Social Ads',
    recommendation: 'Reallocate unspent search ad budget to targeted developer social campaigns to boost lead generation by 28%.',
    impactEstimate: '+$1.4M Pipeline Addition',
    confidenceScore: 97,
    explainabilityWhy: 'Developer social campaigns generate 4.8x ROAS compared to 3.2x search ad baseline.',
  },
  {
    id: 'cmo-rec-2',
    title: 'Launch Interactive Digital Twin Demo Campaign',
    recommendation: 'Promote interactive Digital Twin sandbox simulations in video ad creatives to lower CAC by $320.',
    impactEstimate: '22% Lower CAC',
    confidenceScore: 94,
    explainabilityWhy: 'Interactive sandbox ads demonstrate 3.2x higher conversion velocity than static landing pages.',
  },
];

const DEFAULT_SIMULATIONS: MarketingSimulationScenario[] = [
  { id: 'sim-mkt-1', type: 'Growth', title: 'Global Multi-Channel Product Launch Simulation', projectedRoasGain: 1.8, riskScore: 10, simulationPass: true },
  { id: 'sim-mkt-2', type: 'Budget', title: 'Q4 Ad Spend Re-allocation Simulation', projectedRoasGain: 1.5, riskScore: 8, simulationPass: true },
];

const DEFAULT_AUDIT_FINDINGS: MarketingAuditFinding[] = [
  { id: 'aud-mkt-1', findingTitle: 'Verified SHA-256 Attribution Hash & Privacy Compliance', severity: 'Low', evidence: '100% lead tracking events meet global privacy standards with Vault audit logs.', status: 'Mitigated' },
];

export const useMarketingGrowthStore = create<MarketingGrowthState>((set) => ({
  qualifiedLeadsCount: 1240,
  cacAmount: 1450,
  roasMultiplier: 4.2,
  marketingRoiPercent: 380,
  marketingHealthScore: 98,

  campaigns: DEFAULT_CAMPAIGNS,
  segments: DEFAULT_SEGMENTS,
  cmoRecommendations: DEFAULT_CMO_RECOMMENDATIONS,
  simulations: DEFAULT_SIMULATIONS,
  auditFindings: DEFAULT_AUDIT_FINDINGS,

  updateCampaignStatus: (id, newStatus) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, status: newStatus } : c)),
    })),

  runMarketingSimulation: (type, title) => {
    const newSim: MarketingSimulationScenario = {
      id: `sim-mkt-${Date.now()}`,
      type,
      title,
      projectedRoasGain: 1.6,
      riskScore: 12,
      simulationPass: true,
    };

    set((state) => ({ simulations: [newSim, ...state.simulations] }));
    return newSim;
  },

  resolveMarketingAuditFinding: (id) =>
    set((state) => ({
      auditFindings: state.auditFindings.map((f) => (f.id === id ? { ...f, status: 'Mitigated' } : f)),
    })),
}));
