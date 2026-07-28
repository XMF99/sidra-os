import { EventTopic, EventSubscription, SidraEvent } from './types';

export class TopicRouter {
  private topics = new Map<string, EventTopic>();
  private subscriptions = new Map<string, EventSubscription>();

  constructor() {
    this.seedDefaultTopics();
  }

  private seedDefaultTopics(): void {
    const defaults: EventTopic[] = [
      { name: 'mission.events', category: 'mission', description: 'Mission creation, milestone, and progress events', retentionPolicy: 'forever', subscriberCount: 2, totalPublished: 14 },
      { name: 'workflow.events', category: 'workflow', description: 'Workflow step execution, approval, and completion events', retentionPolicy: 'time_7d', subscriberCount: 3, totalPublished: 28 },
      { name: 'automation.events', category: 'automation', description: 'Automation rule triggers and execution logs', retentionPolicy: 'time_24h', subscriberCount: 2, totalPublished: 45 },
      { name: 'agent.events', category: 'runtime', description: 'AI Agent task assignments, state changes, and supervision logs', retentionPolicy: 'time_7d', subscriberCount: 4, totalPublished: 32 },
      { name: 'decision.events', category: 'decision', description: 'Decision Engine evaluations, policy checks, and scoring events', retentionPolicy: 'forever', subscriberCount: 2, totalPublished: 19 },
      { name: 'planning.events', category: 'planning', description: 'Planning Engine strategy creation, optimization, and replan events', retentionPolicy: 'forever', subscriberCount: 2, totalPublished: 11 },
      { name: 'execution.events', category: 'execution', description: 'Execution Coordination Engine task dispatching and recovery logs', retentionPolicy: 'time_7d', subscriberCount: 3, totalPublished: 22 },
      { name: 'resource.events', category: 'resource', description: 'Resource pool allocation, reservations, and lease renewals', retentionPolicy: 'time_24h', subscriberCount: 2, totalPublished: 16 },
      { name: 'connector.events', category: 'connector', description: 'Connector framework discovery, execution, and health events', retentionPolicy: 'time_24h', subscriberCount: 1, totalPublished: 50 },
      { name: 'system.all', category: 'system', description: 'Global system health, telemetry, and platform boot events', retentionPolicy: 'forever', subscriberCount: 5, totalPublished: 60 },
    ];

    defaults.forEach((t) => this.topics.set(t.name, t));
  }

  public registerTopic(topic: EventTopic): void {
    this.topics.set(topic.name, topic);
  }

  public getTopic(name: string): EventTopic | undefined {
    return this.topics.get(name);
  }

  public getAllTopics(): EventTopic[] {
    return Array.from(this.topics.values());
  }

  public registerSubscription(sub: EventSubscription): void {
    this.subscriptions.set(sub.id, sub);
    const top = this.topics.get(sub.topicPattern);
    if (top) {
      top.subscriberCount += 1;
    }
  }

  public removeSubscription(id: string): void {
    this.subscriptions.delete(id);
  }

  public getAllSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  public routeEvent(event: SidraEvent): EventSubscription[] {
    const matchingSubs: EventSubscription[] = [];

    this.subscriptions.forEach((sub) => {
      if (this.matchesPattern(event.topic, sub.topicPattern)) {
        if (!sub.filterPredicate || sub.filterPredicate(event)) {
          matchingSubs.push(sub);
        }
      }
    });

    // Increment topic published count
    const topicObj = this.topics.get(event.topic);
    if (topicObj) {
      topicObj.totalPublished += 1;
      topicObj.lastPublishedAt = event.metadata.timestamp;
    }

    return matchingSubs;
  }

  private matchesPattern(topic: string, pattern: string): boolean {
    if (pattern === '*' || pattern === topic) return true;
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return topic.startsWith(prefix);
    }
    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(2);
      return topic.endsWith(suffix);
    }
    return false;
  }
}
