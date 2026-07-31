import { describe, it, expect } from 'vitest';
import { useSalesRevenueStore } from '../useSalesRevenueStore';

describe('useSalesRevenueStore', () => {
  it('manages Sales Workspace metrics and bookings', () => {
    const store = useSalesRevenueStore.getState();
    expect(store.pipelineValueArr).toBeGreaterThan(0);
    expect(store.bookingsArr).toBeGreaterThan(0);
    expect(store.quotaAttainmentPercent).toBeGreaterThanOrEqual(100);
    expect(store.revenueHealthScore).toBeGreaterThanOrEqual(95);
  });

  it('delivers Virtual AI CRO recommendations with high confidence scores', () => {
    const store = useSalesRevenueStore.getState();
    expect(store.croRecommendations.length).toBeGreaterThan(0);
    expect(store.croRecommendations.every((rec) => rec.confidenceScore >= 90)).toBe(true);
  });

  it('manages opportunities and quote approval workflows', () => {
    const store = useSalesRevenueStore.getState();
    expect(store.quotes.length).toBeGreaterThan(0);

    const firstQuote = store.quotes[0];
    store.approveQuote(firstQuote.id);

    expect(useSalesRevenueStore.getState().quotes.find((q) => q.id === firstQuote.id)?.approvalStatus).toBe('Approved');
  });

  it('executes Sales Digital Twin simulations inside the isolated sandbox', () => {
    const store = useSalesRevenueStore.getState();
    const initialCount = store.simulations.length;

    const sim = store.runRevenueSimulation('Pricing', 'Tiered Pricing Expansion Scenario Simulation');
    expect(sim.simulationPass).toBe(true);
    expect(sim.projectedRevenueGain).toBeGreaterThan(0);
    expect(useSalesRevenueStore.getState().simulations.length).toBe(initialCount + 1);
  });

  it('manages AI Revenue Auditor findings and mitigation workflows', () => {
    const store = useSalesRevenueStore.getState();
    expect(store.auditFindings.length).toBeGreaterThan(0);

    const firstFinding = store.auditFindings[0];
    store.resolveRevenueAuditFinding(firstFinding.id);

    expect(useSalesRevenueStore.getState().auditFindings.find((f) => f.id === firstFinding.id)?.status).toBe('Mitigated');
  });
});
