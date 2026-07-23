import { ModelInfo } from './types';
import { ModelRegistry } from './ModelRegistry';

export class RoutingEngine {
  private static instance: RoutingEngine;
  private categoryPolicies: Record<string, string> = {
    coding: 'gpt-4o',
    documentation: 'claude-3-5-sonnet',
    reasoning: 'claude-3-5-sonnet',
    vision: 'gemini-1.5-pro',
    translation: 'gpt-4o',
    search: 'openrouter-auto',
  };

  public static getInstance(): RoutingEngine {
    if (!RoutingEngine.instance) {
      RoutingEngine.instance = new RoutingEngine();
    }
    return RoutingEngine.instance;
  }

  public setPolicy(category: string, modelId: string): void {
    this.categoryPolicies[category.toLowerCase()] = modelId;
  }

  public selectModel(categoryHint?: string): ModelInfo {
    const registry = ModelRegistry.getInstance();

    if (categoryHint) {
      const preferredModelId = this.categoryPolicies[categoryHint.toLowerCase()];
      if (preferredModelId) {
        const model = registry.get(preferredModelId);
        if (model && model.status === 'active') {
          return model;
        }
      }
    }

    // Default fallback: select active model with highest priority
    const allActive = registry.getAll().filter((m) => m.status === 'active');
    allActive.sort((a, b) => b.priority - a.priority);

    if (allActive.length === 0) {
      throw new Error('No active AI models available in ModelRegistry.');
    }

    return allActive[0];
  }
}
