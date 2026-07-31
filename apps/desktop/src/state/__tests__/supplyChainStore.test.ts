import { describe, it, expect } from 'vitest';
import { useSupplyChainStore } from '../useSupplyChainStore';

describe('useSupplyChainStore', () => {
  it('manages Supply Chain Workspace metrics and inventory health', () => {
    const store = useSupplyChainStore.getState();
    expect(store.inventoryHealthScore).toBeGreaterThanOrEqual(95);
    expect(store.warehouseUtilizationPercent).toBeGreaterThan(70);
    expect(store.supplierOnTimeRatePercent).toBeGreaterThan(90);
    expect(store.fulfillmentVelocityPercent).toBeGreaterThan(95);
  });

  it('delivers Virtual AI CSCO recommendations with high confidence scores', () => {
    const store = useSupplyChainStore.getState();
    expect(store.cscoRecommendations.length).toBeGreaterThan(0);
    expect(store.cscoRecommendations.every((rec) => rec.confidenceScore >= 90)).toBe(true);
  });

  it('manages purchase order approvals and supplier workflows', () => {
    const store = useSupplyChainStore.getState();
    expect(store.purchaseOrders.length).toBeGreaterThan(0);

    const draftPO = store.purchaseOrders.find((p) => p.status === 'Draft') || store.purchaseOrders[0];
    store.approvePurchaseOrder(draftPO.id);

    expect(useSupplyChainStore.getState().purchaseOrders.find((p) => p.id === draftPO.id)?.status).toBe('Approved');
  });

  it('executes Supply Chain Digital Twin simulations inside the isolated sandbox', () => {
    const store = useSupplyChainStore.getState();
    const initialCount = store.simulations.length;

    const sim = store.runSupplyChainSimulation('Demand', 'Q4 Hardware Demand Surge Simulation');
    expect(sim.simulationPass).toBe(true);
    expect(sim.projectedCostReduction).toBeGreaterThan(0);
    expect(useSupplyChainStore.getState().simulations.length).toBe(initialCount + 1);
  });

  it('manages AI Supply Auditor findings and mitigation workflows', () => {
    const store = useSupplyChainStore.getState();
    expect(store.auditFindings.length).toBeGreaterThan(0);

    const firstFinding = store.auditFindings[0];
    store.resolveSupplyAuditFinding(firstFinding.id);

    expect(useSupplyChainStore.getState().auditFindings.find((f) => f.id === firstFinding.id)?.status).toBe('Mitigated');
  });
});
