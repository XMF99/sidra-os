import { describe, it, expect } from 'vitest';
import { useProjectPortfolioStore } from '../useProjectPortfolioStore';

describe('useProjectPortfolioStore', () => {
  it('manages Portfolio Workspace metrics and strategic alignment', () => {
    const store = useProjectPortfolioStore.getState();
    expect(store.portfolioHealthScore).toBeGreaterThanOrEqual(95);
    expect(store.strategicAlignmentPercent).toBeGreaterThan(90);
    expect(store.budgetUtilizationPercent).toBeGreaterThan(70);
    expect(store.scheduleHealthPercent).toBeGreaterThan(90);
  });

  it('delivers Virtual AI PMO recommendations with high confidence scores', () => {
    const store = useProjectPortfolioStore.getState();
    expect(store.pmoRecommendations.length).toBeGreaterThan(0);
    expect(store.pmoRecommendations.every((rec) => rec.confidenceScore >= 90)).toBe(true);
  });

  it('manages enterprise project status tracking workflows', () => {
    const store = useProjectPortfolioStore.getState();
    expect(store.projects.length).toBeGreaterThan(0);

    const firstProject = store.projects[0];
    store.updateProjectStatus(firstProject.id, 'Completed');

    expect(useProjectPortfolioStore.getState().projects.find((p) => p.id === firstProject.id)?.status).toBe('Completed');
  });

  it('executes Project Digital Twin simulations inside the isolated sandbox', () => {
    const store = useProjectPortfolioStore.getState();
    const initialCount = store.simulations.length;

    const sim = store.runProjectSimulation('PortfolioOptimization', 'Enterprise Portfolio Optimization Simulation');
    expect(sim.simulationPass).toBe(true);
    expect(sim.projectedVelocityGain).toBeGreaterThan(0);
    expect(useProjectPortfolioStore.getState().simulations.length).toBe(initialCount + 1);
  });

  it('manages AI Portfolio Auditor findings and mitigation workflows', () => {
    const store = useProjectPortfolioStore.getState();
    expect(store.auditFindings.length).toBeGreaterThan(0);

    const firstFinding = store.auditFindings[0];
    store.resolvePortfolioAuditFinding(firstFinding.id);

    expect(useProjectPortfolioStore.getState().auditFindings.find((f) => f.id === firstFinding.id)?.status).toBe('Mitigated');
  });
});
