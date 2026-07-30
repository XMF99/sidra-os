import { describe, it, expect } from 'vitest';
import { useAutonomousOrgStore } from '../useAutonomousOrgStore';

describe('useAutonomousOrgStore', () => {
  it('manages Hybrid Human + AI Workforce Registry and worker statuses', () => {
    const store = useAutonomousOrgStore.getState();
    expect(store.workforce.length).toBeGreaterThan(0);

    const firstWorker = store.workforce[0];
    store.updateWorkerStatus(firstWorker.id, 'Busy', 95);
    const updatedWorker = useAutonomousOrgStore.getState().workforce.find((w) => w.id === firstWorker.id);

    expect(updatedWorker?.status).toBe('Busy');
    expect(updatedWorker?.workloadPercent).toBe(95);
  });

  it('triggers daily morning briefings with automated risk detection', () => {
    const store = useAutonomousOrgStore.getState();
    const initialCount = store.briefings.length;

    const newBriefing = store.triggerDailyMorningBriefing();
    const updatedBriefings = useAutonomousOrgStore.getState().briefings;

    expect(updatedBriefings.length).toBe(initialCount + 1);
    expect(newBriefing.aiAutonomyPercent).toBeGreaterThan(80);
    expect(newBriefing.topRisks.length).toBeGreaterThan(0);
  });

  it('logs autonomous governance decisions and policy enforcement events', () => {
    const store = useAutonomousOrgStore.getState();
    const initialCount = store.decisionLogs.length;

    store.logAutonomousDecision({
      action: 'Approve',
      targetSubject: 'Rust Engine Compilation Pipeline Run',
      reasoning: 'Cargo check and Clippy passed cleanly with zero warnings.',
      governancePolicy: 'Immutable Execution Contract Policy v1',
    });

    const updatedLogs = useAutonomousOrgStore.getState().decisionLogs;
    expect(updatedLogs.length).toBe(initialCount + 1);
    expect(updatedLogs[0].targetSubject).toContain('Rust Engine Compilation');
  });

  it('monitors active department runtimes and health scores', () => {
    const store = useAutonomousOrgStore.getState();
    expect(store.runtimes.length).toBeGreaterThan(0);
    expect(store.runtimes.every((r) => r.healthScore >= 90)).toBe(true);
  });
});
