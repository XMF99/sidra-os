import { describe, it, expect } from 'vitest';
import { useDigitalTwinStore } from '../useDigitalTwinStore';

describe('useDigitalTwinStore', () => {
  it('manages Digital Twin snapshots and zero-production-mutation sandbox', () => {
    const store = useDigitalTwinStore.getState();
    expect(store.snapshots.length).toBeGreaterThan(0);

    store.createSnapshot('Future State 2027');
    const updatedSnapshots = useDigitalTwinStore.getState().snapshots;
    expect(updatedSnapshots.some((s) => s.name === 'Future State 2027')).toBe(true);

    store.restoreSnapshot(updatedSnapshots[0].id);
    expect(useDigitalTwinStore.getState().activeSnapshotId).toBe(updatedSnapshots[0].id);
  });

  it('runs What-If hypothetical queries inside Digital Twin Sandbox', () => {
    const store = useDigitalTwinStore.getState();
    const queryResult = store.runWhatIfQuery('What if budget drops by 40%?');

    expect(queryResult.question).toBe('What if budget drops by 40%?');
    expect(queryResult.projectedOutcome).toContain('Digital Twin sandbox');
    expect(useDigitalTwinStore.getState().whatIfQueries.length).toBeGreaterThan(2);
  });

  it('evaluates Scenario Simulation variants and rankings', () => {
    const store = useDigitalTwinStore.getState();
    expect(store.scenarios.length).toBe(5);

    const balancedScen = store.scenarios.find((s) => s.variant === 'Balanced');
    expect(balancedScen).toBeDefined();
    expect(balancedScen?.weightedScore).toBeGreaterThanOrEqual(90);
  });

  it('proposes Resource Optimizer allocations and surfaces proactive opportunities', () => {
    const store = useDigitalTwinStore.getState();
    expect(store.resourceProposals.length).toBeGreaterThan(0);
    expect(store.opportunities.length).toBeGreaterThan(0);
  });

  it('stages Execution Previews and handles Human Approval gates', () => {
    const store = useDigitalTwinStore.getState();

    store.stageExecutionPreview({
      planId: 'plan-test-01',
      planTitle: 'Test Deployment Plan',
      createdObjects: ['New Space'],
      updatedObjects: ['Vault Hash'],
      deletedObjects: [],
      rollbackStrategy: 'Revert Snapshot',
      humanApprovalRequired: true,
      isApproved: false,
    });

    expect(useDigitalTwinStore.getState().stagedPreview?.planTitle).toBe('Test Deployment Plan');
    expect(useDigitalTwinStore.getState().stagedPreview?.isApproved).toBe(false);

    store.approveExecutionPlan('plan-test-01');
    expect(useDigitalTwinStore.getState().stagedPreview?.isApproved).toBe(true);

    store.clearStagedPreview();
    expect(useDigitalTwinStore.getState().stagedPreview).toBeNull();
  });
});
