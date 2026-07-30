import { describe, it, expect } from 'vitest';
import { useExecutiveOrchestratorStore } from '../useExecutiveOrchestratorStore';

describe('useExecutiveOrchestratorStore', () => {
  it('manages Mission Decomposition DAG tasks', () => {
    const store = useExecutiveOrchestratorStore.getState();
    expect(store.tasks.length).toBeGreaterThan(0);

    store.addDecomposedTask({
      title: 'Deploy Production Security Audit Bot',
      category: 'Mission',
      assignedAgent: 'Security Sub-Agent',
      progress: 0,
      status: 'Queued',
      dependencies: ['task-101'],
    });

    const updatedTasks = useExecutiveOrchestratorStore.getState().tasks;
    expect(updatedTasks.some((t) => t.title === 'Deploy Production Security Audit Bot')).toBe(true);
  });

  it('enforces immutable Execution Contracts and digital human signing', () => {
    const store = useExecutiveOrchestratorStore.getState();
    expect(store.contracts.length).toBeGreaterThan(0);

    const initialContract = store.contracts[0];
    expect(initialContract.signedByHuman).toBe(true);
    expect(initialContract.successCriteria.length).toBeGreaterThan(0);
  });

  it('tracks active Failure Recovery alerts and resolves timeout incidents', () => {
    const store = useExecutiveOrchestratorStore.getState();
    expect(store.failures.length).toBeGreaterThan(0);

    const firstFailure = store.failures[0];
    expect(firstFailure.status).toBe('Recovering');

    store.triggerFailureRecovery(firstFailure.id);
    const updatedFailures = useExecutiveOrchestratorStore.getState().failures;
    expect(updatedFailures.find((f) => f.id === firstFailure.id)?.status).toBe('Resolved');
  });

  it('monitors Executive Control Tower operational metrics', () => {
    const store = useExecutiveOrchestratorStore.getState();
    expect(store.controlTowerMetrics.orgHealthScore).toBe(98);
    expect(store.controlTowerMetrics.activeExecutionsCount).toBeGreaterThan(0);
  });

  it('configures Autonomous Execution Governance Policies', () => {
    const store = useExecutiveOrchestratorStore.getState();
    expect(store.activePolicyLevel).toBe('Semi-Autonomous');

    store.setPolicyLevel('Autonomous');
    expect(useExecutiveOrchestratorStore.getState().activePolicyLevel).toBe('Autonomous');
  });
});
