import { describe, it, expect } from 'vitest';
import { useCapabilityIntelligenceStore } from '../useCapabilityIntelligenceStore';

describe('useCapabilityIntelligenceStore', () => {
  it('manages Capability Registry and lifecycle state transitions', () => {
    const store = useCapabilityIntelligenceStore.getState();
    expect(store.capabilities.length).toBeGreaterThan(0);

    const firstCap = store.capabilities[0];
    store.updateLifecycleState(firstCap.id, 'Approved');
    expect(useCapabilityIntelligenceStore.getState().capabilities.find((c) => c.id === firstCap.id)?.lifecycleState).toBe('Approved');
  });

  it('instantiates new business capability drafts from pre-built templates', () => {
    const store = useCapabilityIntelligenceStore.getState();
    const initialCount = store.capabilities.length;

    store.createCapabilityFromTemplate('tmpl-game');
    const updatedCapabilities = useCapabilityIntelligenceStore.getState().capabilities;

    expect(updatedCapabilities.length).toBe(initialCount + 1);
    expect(updatedCapabilities[0].name).toContain('Game Development Pipeline');
  });

  it('registers custom composed business capabilities', () => {
    const store = useCapabilityIntelligenceStore.getState();
    const initialCount = store.capabilities.length;

    store.registerCapability({
      name: 'Custom HR Onboarding Capability',
      version: '1.0.0',
      category: 'Operations',
      owner: 'HR Director',
      description: 'Composed onboarding capability',
      lifecycleState: 'Draft',
      composedModels: ['claude-3-5-sonnet'],
      composedTools: ['mcp-fs'],
      composedConnectors: ['Slack Workspace'],
      dependencies: [],
      permissionsRequired: ['slack:post'],
    });

    expect(useCapabilityIntelligenceStore.getState().capabilities.length).toBe(initialCount + 1);
  });

  it('resolves capability dependency graph nodes', () => {
    const store = useCapabilityIntelligenceStore.getState();
    expect(store.dependencyNodes.length).toBeGreaterThan(0);
    expect(store.dependencyNodes.every((n) => !n.hasConflict)).toBe(true);
  });
});
