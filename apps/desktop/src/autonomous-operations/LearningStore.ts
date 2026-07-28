import { LearningEvent } from './types';

export class LearningStore {
  private learningEvents: LearningEvent[] = [];

  constructor() {
    this.seedDefaultLearnings();
  }

  private seedDefaultLearnings(): void {
    const defaults: LearningEvent[] = [
      {
        id: 'lrn_01',
        eventType: 'PatternDiscovery',
        lessonLearned: 'Parallel execution of vector searches alongside plan evaluations reduces mission latency by 22%.',
        confidenceScore: 94,
        timestamp: new Date().toISOString(),
      },
      {
        id: 'lrn_02',
        eventType: 'CapacityPrediction',
        lessonLearned: 'Memory utilization stays below 45% during peak agent swarm execution when token caches are pre-warmed.',
        confidenceScore: 91,
        timestamp: new Date().toISOString(),
      },
    ];

    defaults.forEach((l) => this.learningEvents.push(l));
  }

  public recordLearning(lessonLearned: string, eventType = 'OptimizationInsight', confidenceScore = 90): LearningEvent {
    const event: LearningEvent = {
      id: `LRN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventType,
      lessonLearned,
      confidenceScore,
      timestamp: new Date().toISOString(),
    };
    this.learningEvents.unshift(event);
    if (this.learningEvents.length > 500) {
      this.learningEvents.pop();
    }
    return event;
  }

  public getInsights(): LearningEvent[] {
    return [...this.learningEvents];
  }
}
