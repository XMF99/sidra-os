import { describe, it, expect } from 'vitest';
import { useCapabilityPlatformStore } from '../useCapabilityPlatformStore';
import { useOrganizationSpacesStore } from '../useOrganizationSpacesStore';

describe('useCapabilityPlatformStore & useOrganizationSpacesStore', () => {
  it('generates Workspace Blueprints from natural language prompt', async () => {
    const store = useCapabilityPlatformStore.getState();
    store.generateBlueprintFromPrompt('I want a game studio with narrative AI');
    expect(useCapabilityPlatformStore.getState().isGeneratingBlueprint).toBe(true);

    await new Promise((r) => setTimeout(r, 700));

    const variants = useCapabilityPlatformStore.getState().generatedVariants;
    expect(variants.length).toBeGreaterThan(0);
    expect(variants.some((v) => v.thekyConfidenceScore === 98)).toBe(true);
  });

  it('duplicates and forks Workspace Blueprints', () => {
    const store = useCapabilityPlatformStore.getState();
    const initialBlueprint = store.blueprints[0];
    store.duplicateBlueprint(initialBlueprint.id);
    const updatedBlueprints = useCapabilityPlatformStore.getState().blueprints;
    expect(updatedBlueprints.some((b) => b.name.includes('(Copy)'))).toBe(true);
  });

  it('manages Organization Spaces and Team AI isolation rules', () => {
    const spacesStore = useOrganizationSpacesStore.getState();
    spacesStore.createSpace('Game Dev Space', 'Engineering', 'Custom studio space');
    const createdSpace = useOrganizationSpacesStore.getState().spaces.find((s) => s.name === 'Game Dev Space');
    expect(createdSpace).toBeDefined();
    expect(createdSpace?.aiContextRules.isolatedMemoryScope).toBe('scope_engineering_vault');
  });

  it('adds and removes space members', () => {
    const spacesStore = useOrganizationSpacesStore.getState();
    const spaceId = spacesStore.spaces[0].id;
    spacesStore.addSpaceMember(spaceId, { name: 'New Engineer', role: 'Member', email: 'eng@sidra.os' });
    const members = useOrganizationSpacesStore.getState().spaces[0].members;
    expect(members.some((m) => m.name === 'New Engineer')).toBe(true);
  });
});
