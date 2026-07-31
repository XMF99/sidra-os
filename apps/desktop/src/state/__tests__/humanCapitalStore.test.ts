import { describe, it, expect } from 'vitest';
import { useHumanCapitalStore } from '../useHumanCapitalStore';

describe('useHumanCapitalStore', () => {
  it('manages Human Capital Workspace metrics and headcount', () => {
    const store = useHumanCapitalStore.getState();
    expect(store.headcountHuman).toBeGreaterThan(0);
    expect(store.headcountAi).toBeGreaterThan(0);
    expect(store.retentionRatePercent).toBeGreaterThanOrEqual(90);
  });

  it('delivers Virtual AI CHRO recommendations with high confidence scores', () => {
    const store = useHumanCapitalStore.getState();
    expect(store.chroRecommendations.length).toBeGreaterThan(0);
    expect(store.chroRecommendations.every((rec) => rec.confidenceScore >= 90)).toBe(true);
  });

  it('manages job requisitions and candidate stage progressions', () => {
    const store = useHumanCapitalStore.getState();
    expect(store.candidates.length).toBeGreaterThan(0);

    const firstCandidate = store.candidates[0];
    store.advanceCandidateStage(firstCandidate.id, 'Hired');

    expect(useHumanCapitalStore.getState().candidates.find((c) => c.id === firstCandidate.id)?.stage).toBe('Hired');
  });

  it('executes Human Capital Digital Twin simulations inside the isolated sandbox', () => {
    const store = useHumanCapitalStore.getState();
    const initialCount = store.simulations.length;

    const sim = store.runPeopleSimulation('Restructuring', 'AI Sub-Agent Workload Expansion Simulation');
    expect(sim.simulationPass).toBe(true);
    expect(sim.projectedRetentionGain).toBeGreaterThan(0);
    expect(useHumanCapitalStore.getState().simulations.length).toBe(initialCount + 1);
  });

  it('manages AI Workforce Auditor findings and mitigation workflows', () => {
    const store = useHumanCapitalStore.getState();
    expect(store.auditFindings.length).toBeGreaterThan(0);

    const firstFinding = store.auditFindings[0];
    store.resolveHrAuditFinding(firstFinding.id);

    expect(useHumanCapitalStore.getState().auditFindings.find((f) => f.id === firstFinding.id)?.status).toBe('Mitigated');
  });
});
