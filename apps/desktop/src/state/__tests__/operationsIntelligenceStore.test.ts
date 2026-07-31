import { describe, it, expect } from 'vitest';
import { useOperationsIntelligenceStore } from '../useOperationsIntelligenceStore';

describe('useOperationsIntelligenceStore', () => {
  it('manages Operations Workspace metrics and execution health', () => {
    const store = useOperationsIntelligenceStore.getState();
    expect(store.operationalHealthScore).toBeGreaterThanOrEqual(95);
    expect(store.executionProgressPercent).toBeGreaterThan(80);
    expect(store.capacityUtilizationPercent).toBeGreaterThan(70);
    expect(store.resourceEfficiencyPercent).toBeGreaterThan(90);
  });

  it('delivers Virtual AI COO recommendations with high confidence scores', () => {
    const store = useOperationsIntelligenceStore.getState();
    expect(store.cooRecommendations.length).toBeGreaterThan(0);
    expect(store.cooRecommendations.every((rec) => rec.confidenceScore >= 90)).toBe(true);
  });

  it('manages execution task completion workflows', () => {
    const store = useOperationsIntelligenceStore.getState();
    expect(store.tasks.length).toBeGreaterThan(0);

    const firstTask = store.tasks[0];
    store.completeExecutionTask(firstTask.id);

    expect(useOperationsIntelligenceStore.getState().tasks.find((t) => t.id === firstTask.id)?.status).toBe('Done');
  });

  it('executes Operations Digital Twin simulations inside the isolated sandbox', () => {
    const store = useOperationsIntelligenceStore.getState();
    const initialCount = store.simulations.length;

    const sim = store.runOperationsSimulation('Capacity', 'Multi-Region Compute Capacity Simulation');
    expect(sim.simulationPass).toBe(true);
    expect(sim.projectedThroughputGain).toBeGreaterThan(0);
    expect(useOperationsIntelligenceStore.getState().simulations.length).toBe(initialCount + 1);
  });

  it('manages AI Operations Auditor findings and mitigation workflows', () => {
    const store = useOperationsIntelligenceStore.getState();
    expect(store.auditFindings.length).toBeGreaterThan(0);

    const firstFinding = store.auditFindings[0];
    store.resolveOperationsAuditFinding(firstFinding.id);

    expect(useOperationsIntelligenceStore.getState().auditFindings.find((f) => f.id === firstFinding.id)?.status).toBe('Mitigated');
  });
});
