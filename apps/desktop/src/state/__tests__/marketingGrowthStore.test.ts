import { describe, it, expect } from 'vitest';
import { useMarketingGrowthStore } from '../useMarketingGrowthStore';

describe('useMarketingGrowthStore', () => {
  it('manages Marketing Workspace metrics and lead generation', () => {
    const store = useMarketingGrowthStore.getState();
    expect(store.qualifiedLeadsCount).toBeGreaterThan(0);
    expect(store.roasMultiplier).toBeGreaterThan(1.0);
    expect(store.marketingRoiPercent).toBeGreaterThan(100);
    expect(store.marketingHealthScore).toBeGreaterThanOrEqual(95);
  });

  it('delivers Virtual AI CMO recommendations with high confidence scores', () => {
    const store = useMarketingGrowthStore.getState();
    expect(store.cmoRecommendations.length).toBeGreaterThan(0);
    expect(store.cmoRecommendations.every((rec) => rec.confidenceScore >= 90)).toBe(true);
  });

  it('manages marketing campaigns and status updates', () => {
    const store = useMarketingGrowthStore.getState();
    expect(store.campaigns.length).toBeGreaterThan(0);

    const firstCampaign = store.campaigns[0];
    store.updateCampaignStatus(firstCampaign.id, 'Completed');

    expect(useMarketingGrowthStore.getState().campaigns.find((c) => c.id === firstCampaign.id)?.status).toBe('Completed');
  });

  it('executes Marketing Digital Twin simulations inside the isolated sandbox', () => {
    const store = useMarketingGrowthStore.getState();
    const initialCount = store.simulations.length;

    const sim = store.runMarketingSimulation('Growth', 'Global Developer Hackathon Expansion Simulation');
    expect(sim.simulationPass).toBe(true);
    expect(sim.projectedRoasGain).toBeGreaterThan(0);
    expect(useMarketingGrowthStore.getState().simulations.length).toBe(initialCount + 1);
  });

  it('manages AI Marketing Auditor findings and mitigation workflows', () => {
    const store = useMarketingGrowthStore.getState();
    expect(store.auditFindings.length).toBeGreaterThan(0);

    const firstFinding = store.auditFindings[0];
    store.resolveMarketingAuditFinding(firstFinding.id);

    expect(useMarketingGrowthStore.getState().auditFindings.find((f) => f.id === firstFinding.id)?.status).toBe('Mitigated');
  });
});
