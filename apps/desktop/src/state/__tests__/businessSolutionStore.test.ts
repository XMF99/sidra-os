import { describe, it, expect } from 'vitest';
import { useBusinessSolutionStore } from '../useBusinessSolutionStore';

describe('useBusinessSolutionStore', () => {
  it('manages Business Solution Registry and lifecycle governance', () => {
    const store = useBusinessSolutionStore.getState();
    expect(store.solutions.length).toBeGreaterThan(0);

    const firstSol = store.solutions[0];
    store.updateSolutionLifecycle(firstSol.id, 'Approved');
    expect(useBusinessSolutionStore.getState().solutions.find((s) => s.id === firstSol.id)?.lifecycleState).toBe('Approved');
  });

  it('generates Enterprise Blueprints with architecture DAG flows and compliance mandates', () => {
    const store = useBusinessSolutionStore.getState();
    const firstSol = store.solutions[0];

    const blueprint = store.generateBlueprint(firstSol.id);
    expect(blueprint.solutionId).toBe(firstSol.id);
    expect(blueprint.executionFlowDag.length).toBeGreaterThan(0);
    expect(blueprint.complianceMandates.length).toBeGreaterThan(0);
    expect(useBusinessSolutionStore.getState().blueprints.length).toBeGreaterThan(0);
  });

  it('instantiates new enterprise solution drafts from pre-built templates', () => {
    const store = useBusinessSolutionStore.getState();
    const initialCount = store.solutions.length;

    store.instantiateSolutionFromTemplate('tmpl-sol-gamestudio');
    const updatedSolutions = useBusinessSolutionStore.getState().solutions;

    expect(updatedSolutions.length).toBe(initialCount + 1);
    expect(updatedSolutions[0].name).toContain('Game Studio Enterprise Solution');
  });

  it('registers custom composed enterprise business solutions', () => {
    const store = useBusinessSolutionStore.getState();
    const initialCount = store.solutions.length;

    store.registerSolution({
      name: 'Custom Creative Agency Operating Solution',
      version: '1.0.0',
      domain: 'Software Company',
      owner: 'Creative Director',
      description: 'Composed creative agency solution',
      lifecycleState: 'Draft',
      includedCapabilityIds: ['cap-mktg'],
      requiredConnectors: ['Slack Workspace'],
      securityProfile: 'Standard Enterprise',
    });

    expect(useBusinessSolutionStore.getState().solutions.length).toBe(initialCount + 1);
  });
});
