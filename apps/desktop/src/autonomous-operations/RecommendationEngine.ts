import { RecommendationItem } from './types';

export class RecommendationEngine {
  private recommendations: RecommendationItem[] = [];

  constructor() {
    this.seedDefaultRecommendations();
  }

  private seedDefaultRecommendations(): void {
    const defaults: RecommendationItem[] = [
      {
        id: 'rec_cache_agent',
        title: 'Pre-warm AI Agent Context Cache',
        type: 'cache',
        priority: 'high',
        targetRuntime: 'agent',
        rationale: 'Frequent agent task execution can save ~140ms per step by caching system prompt embeddings.',
        impactScore: 88,
        autoApplyable: true,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rec_connector_backoff',
        title: 'Tune Connector Retry Backoff Multiplier',
        type: 'retry',
        priority: 'medium',
        targetRuntime: 'connector',
        rationale: 'Lowering base retry delay from 100ms to 50ms speeds up transient network recovery.',
        impactScore: 75,
        autoApplyable: true,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rec_policy_spend_threshold',
        title: 'Adjust Spend Policy Human Approval Bound',
        type: 'policy',
        priority: 'low',
        targetRuntime: 'policy',
        rationale: 'Financial spend bounds are operating efficiently; suggest raising auto-approve threshold to $150 USD.',
        impactScore: 65,
        autoApplyable: false,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];

    defaults.forEach((r) => this.recommendations.push(r));
  }

  public generateRecommendations(): RecommendationItem[] {
    return [...this.recommendations];
  }

  public applyRecommendation(id: string): RecommendationItem | undefined {
    const item = this.recommendations.find((r) => r.id === id);
    if (item) {
      item.status = 'applied';
    }
    return item;
  }

  public dismissRecommendation(id: string): RecommendationItem | undefined {
    const item = this.recommendations.find((r) => r.id === id);
    if (item) {
      item.status = 'dismissed';
    }
    return item;
  }

  public getPendingRecommendations(): RecommendationItem[] {
    return this.recommendations.filter((r) => r.status === 'pending');
  }

  public getAllRecommendations(): RecommendationItem[] {
    return [...this.recommendations];
  }
}
