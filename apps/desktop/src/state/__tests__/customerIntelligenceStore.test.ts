import { describe, it, expect } from 'vitest';
import { useCustomerIntelligenceStore } from '../useCustomerIntelligenceStore';

describe('useCustomerIntelligenceStore', () => {
  it('manages Customer Workspace metrics and pipeline value', () => {
    const store = useCustomerIntelligenceStore.getState();
    expect(store.pipelineValueArr).toBeGreaterThan(0);
    expect(store.openOpportunitiesCount).toBeGreaterThan(0);
    expect(store.customerHealthScore).toBeGreaterThanOrEqual(95);
    expect(store.csatScorePercent).toBeGreaterThanOrEqual(90);
  });

  it('delivers Virtual AI CCO recommendations with high confidence scores', () => {
    const store = useCustomerIntelligenceStore.getState();
    expect(store.ccoRecommendations.length).toBeGreaterThan(0);
    expect(store.ccoRecommendations.every((rec) => rec.confidenceScore >= 90)).toBe(true);
  });

  it('manages sales pipeline deal stage progressions', () => {
    const store = useCustomerIntelligenceStore.getState();
    expect(store.deals.length).toBeGreaterThan(0);

    const firstDeal = store.deals[0];
    store.advanceDealStage(firstDeal.id, 'Closed Won');

    expect(useCustomerIntelligenceStore.getState().deals.find((d) => d.id === firstDeal.id)?.stage).toBe('Closed Won');
  });

  it('executes CRM Digital Twin simulations inside the isolated sandbox', () => {
    const store = useCustomerIntelligenceStore.getState();
    const initialCount = store.simulations.length;

    const sim = store.runCrmSimulation('Expansion', 'Enterprise VIP Account Expansion Simulation');
    expect(sim.simulationPass).toBe(true);
    expect(sim.projectedWinRateGain).toBeGreaterThan(0);
    expect(useCustomerIntelligenceStore.getState().simulations.length).toBe(initialCount + 1);
  });

  it('manages AI Customer Auditor findings and mitigation workflows', () => {
    const store = useCustomerIntelligenceStore.getState();
    expect(store.auditFindings.length).toBeGreaterThan(0);

    const firstFinding = store.auditFindings[0];
    store.resolveCrmAuditFinding(firstFinding.id);

    expect(useCustomerIntelligenceStore.getState().auditFindings.find((f) => f.id === firstFinding.id)?.status).toBe('Mitigated');
  });
});
