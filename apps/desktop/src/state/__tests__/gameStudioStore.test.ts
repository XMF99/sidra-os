import { describe, it, expect } from 'vitest';
import { useGameStudioStore } from '../useGameStudioStore';

describe('useGameStudioStore', () => {
  it('manages Studio Workspace metrics and AAA production health', () => {
    const store = useGameStudioStore.getState();
    expect(store.studioHealthScore).toBeGreaterThanOrEqual(95);
    expect(store.sprintProgressPercent).toBeGreaterThan(80);
    expect(store.dauCount).toBeGreaterThan(1000000);
    expect(store.mauCount).toBeGreaterThan(5000000);
    expect(store.playerRetentionPercent).toBeGreaterThan(50);
  });

  it('delivers Virtual AI Studio Director recommendations & 38-agent hierarchy', () => {
    const store = useGameStudioStore.getState();
    expect(store.directorRecommendations.length).toBeGreaterThan(0);
    expect(store.directorRecommendations.every((rec) => rec.confidenceScore >= 90)).toBe(true);
    expect(store.agents.length).toBeGreaterThan(0);
  });

  it('manages QA bug tracking and resolution workflows', () => {
    const store = useGameStudioStore.getState();
    expect(store.qaBugs.length).toBeGreaterThan(0);

    const firstBug = store.qaBugs[0];
    store.resolveQaBug(firstBug.id);

    expect(useGameStudioStore.getState().qaBugs.find((b) => b.id === firstBug.id)?.status).toBe('Resolved');
  });

  it('executes Game Studio Digital Twin simulations inside the isolated sandbox', () => {
    const store = useGameStudioStore.getState();
    const initialCount = store.simulations.length;

    const sim = store.runStudioSimulation('Release', 'Global Multi-Platform Simultaneous Launch Simulation');
    expect(sim.simulationPass).toBe(true);
    expect(sim.projectedRetentionGain).toBeGreaterThan(0);
    expect(useGameStudioStore.getState().simulations.length).toBe(initialCount + 1);
  });

  it('manages AI Studio Auditor findings and mitigation workflows', () => {
    const store = useGameStudioStore.getState();
    expect(store.auditFindings.length).toBeGreaterThan(0);

    const firstFinding = store.auditFindings[0];
    store.resolveStudioAuditFinding(firstFinding.id);

    expect(useGameStudioStore.getState().auditFindings.find((f) => f.id === firstFinding.id)?.status).toBe('Mitigated');
  });
});
