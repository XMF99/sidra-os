import {
  SidraEvent,
  EventCategory,
  EventPriority,
  EventSubscription,
  ReplayRequest,
  EventBusMetrics,
  EventTopic,
  DeadLetterItem,
} from './types';
import { TopicRouter } from './TopicRouter';
import { EventStore } from './EventStore';
import { DeadLetterQueue } from './DeadLetterQueue';
import { EventMetricsEngine } from './EventMetricsEngine';

export class EventBusEngine {
  private static instance: EventBusEngine;
  private router = new TopicRouter();
  private store = new EventStore();
  private dlq = new DeadLetterQueue();
  private metricsEngine = new EventMetricsEngine();

  private constructor() {
    this.seedDefaultEvents();
  }

  public static getInstance(): EventBusEngine {
    if (!EventBusEngine.instance) {
      EventBusEngine.instance = new EventBusEngine();
    }
    return EventBusEngine.instance;
  }

  private seedDefaultEvents(): void {
    const defaultEvents: Array<{ topic: string; category: EventCategory; title: string }> = [
      { topic: 'mission.events', category: 'mission', title: 'Enterprise Platform Alpha Release Started' },
      { topic: 'workflow.events', category: 'workflow', title: 'Production Deployment Workflow Step Approved' },
      { topic: 'automation.events', category: 'automation', title: 'Hourly Ingestion Rule Triggered' },
      { topic: 'agent.events', category: 'runtime', title: 'AI Code Expert Assigned Task T-101' },
      { topic: 'decision.events', category: 'decision', title: 'Candidate Replanning Option Selected' },
      { topic: 'planning.events', category: 'planning', title: 'Dynamic Replanning Strategy Generated' },
      { topic: 'execution.events', category: 'execution', title: 'Execution Session SES-101 Dispatched' },
      { topic: 'resource.events', category: 'resource', title: 'CPU Core Processing Pool Allocated 4 Cores' },
    ];

    defaultEvents.forEach((item) => {
      this.publish(item.topic, item.category, { title: item.title }, { sourceRuntime: item.category });
    });
  }

  public publish(
    topic: string,
    category: EventCategory,
    payload: Record<string, unknown>,
    options?: {
      correlationId?: string;
      traceId?: string;
      sourceRuntime?: string;
      priority?: EventPriority;
    }
  ): SidraEvent {
    const now = new Date().toISOString();
    const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const event: SidraEvent = {
      id: eventId,
      topic,
      category,
      state: 'published',
      correlationId: options?.correlationId || `corr_${Math.random().toString(36).substring(2, 10)}`,
      traceId: options?.traceId || `tr_${Math.random().toString(36).substring(2, 10)}`,
      sourceRuntime: options?.sourceRuntime || 'system',
      priority: options?.priority || 'medium',
      payload,
      metadata: {
        version: '1.0.0',
        timestamp: now,
        schemaVersion: 'v1',
        ttlMs: 86400000,
      },
      retryCount: 0,
    };

    this.store.saveEvent(event);
    this.metricsEngine.recordPublish();

    const matchingSubs = this.router.routeEvent(event);
    matchingSubs.forEach((sub) => {
      const startTime = Date.now();
      try {
        sub.handler(event);
        event.state = 'delivered';
        this.metricsEngine.recordDelivery(Date.now() - startTime);
      } catch (err) {
        event.retryCount += 1;
        this.metricsEngine.recordRetry();
        if (event.retryCount > 2) {
          this.dlq.addDeadLetter(event, (err as Error).message);
        }
      }
    });

    return event;
  }

  public subscribe(
    topicPattern: string,
    subscriberName: string,
    handler: (event: SidraEvent) => Promise<void> | void,
    priority: EventPriority = 'medium'
  ): EventSubscription {
    const sub: EventSubscription = {
      id: `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      topicPattern,
      subscriberName,
      handler,
      priority,
      createdAt: new Date().toISOString(),
    };

    this.router.registerSubscription(sub);
    return sub;
  }

  public unsubscribe(subscriptionId: string): void {
    this.router.removeSubscription(subscriptionId);
  }

  public replay(request: ReplayRequest): SidraEvent[] {
    const replayed = this.store.replayEvents(request);
    this.metricsEngine.recordReplay(replayed.length);
    return replayed;
  }

  public archive(beforeTimestamp: string): number {
    return this.store.archiveEvents(beforeTimestamp);
  }

  public queryEvents(filter?: {
    topic?: string;
    category?: string;
    correlationId?: string;
    traceId?: string;
    limit?: number;
  }): SidraEvent[] {
    return this.store.queryEvents(filter);
  }

  public getAllTopics(): EventTopic[] {
    return this.router.getAllTopics();
  }

  public getTopic(name: string): EventTopic | undefined {
    return this.router.getTopic(name);
  }

  public getAllSubscriptions(): EventSubscription[] {
    return this.router.getAllSubscriptions();
  }

  public getDeadLetters(): DeadLetterItem[] {
    return this.dlq.getDeadLetters();
  }

  public getMetrics(): EventBusMetrics {
    return this.metricsEngine.getMetrics(
      this.dlq.getDeadLetters().length,
      this.router.getAllSubscriptions().length,
      this.store.getAllEvents()
    );
  }
}
