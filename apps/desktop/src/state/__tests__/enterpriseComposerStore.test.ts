import { describe, it, expect } from 'vitest';
import { useEnterpriseComposerStore } from '../useEnterpriseComposerStore';

describe('useEnterpriseComposerStore', () => {
  it('manages Enterprise Organization Registry and lifecycle state transitions', () => {
    const store = useEnterpriseComposerStore.getState();
    expect(store.enterprises.length).toBeGreaterThan(0);

    const firstEnt = store.enterprises[0];
    store.updateEnterpriseLifecycle(firstEnt.id, 'Approved');
    expect(useEnterpriseComposerStore.getState().enterprises.find((e) => e.id === firstEnt.id)?.lifecycleState).toBe('Approved');
  });

  it('generates Master Enterprise Architecture Blueprints with operating models and governance rules', () => {
    const store = useEnterpriseComposerStore.getState();
    const firstEnt = store.enterprises[0];

    const masterBlueprint = store.generateMasterBlueprint(firstEnt.id);
    expect(masterBlueprint.enterpriseId).toBe(firstEnt.id);
    expect(masterBlueprint.departmentsCount).toBeGreaterThan(0);
    expect(masterBlueprint.governanceRules.length).toBeGreaterThan(0);
    expect(useEnterpriseComposerStore.getState().masterBlueprints.length).toBeGreaterThan(0);
  });

  it('instantiates new enterprise organization drafts from pre-built templates', () => {
    const store = useEnterpriseComposerStore.getState();
    const initialCount = store.enterprises.length;

    store.instantiateEnterpriseFromTemplate('tmpl-ent-gamestudio');
    const updatedEnterprises = useEnterpriseComposerStore.getState().enterprises;

    expect(updatedEnterprises.length).toBe(initialCount + 1);
    expect(updatedEnterprises[0].name).toContain('Game Studio Enterprise');
  });

  it('registers custom composed enterprise organizations', () => {
    const store = useEnterpriseComposerStore.getState();
    const initialCount = store.enterprises.length;

    store.registerEnterprise({
      name: 'Custom Tech Startup Enterprise',
      industry: 'Artificial Intelligence',
      operatingModel: 'Matrix',
      owner: 'Founder Lead',
      lifecycleState: 'Draft',
      departments: [],
      orgChart: [],
    });

    expect(useEnterpriseComposerStore.getState().enterprises.length).toBe(initialCount + 1);
  });
});
