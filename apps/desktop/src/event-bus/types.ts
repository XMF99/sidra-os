export type EventCategory =
  | 'domain'
  | 'system'
  | 'runtime'
  | 'mission'
  | 'workflow'
  | 'automation'
  | 'planning'
  | 'decision'
  | 'execution'
  | 'resource'
  | 'connector'
  | 'developer';

export type EventState =
  | 'created'
  | 'validated'
  | 'persisted'
  | 'queued'
  | 'published'
  | 'delivered'
  | 'acknowledged'
  | 'retried'
  | 'dead_letter'
  | 'archived';

export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

export interface SidraEvent {
  id: string;
  topic: string;
  category: EventCategory;
  state: EventState;
  correlationId: string;
  traceId: string;
  sourceRuntime: string;
  priority: EventPriority;
  payload: Record<string, unknown>;
  metadata: {
    version: string;
    timestamp: string;
    schemaVersion: string;
    ttlMs: number;
  };
  retryCount: number;
}

export interface EventTopic {
  name: string;
  category: EventCategory;
  description: string;
  retentionPolicy: 'time_24h' | 'time_7d' | 'forever';
  subscriberCount: number;
  totalPublished: number;
  lastPublishedAt?: string;
}

export interface EventSubscription {
  id: string;
  topicPattern: string; // e.g. "mission.*", "*.events", "*"
  subscriberName: string;
  handler: (event: SidraEvent) => Promise<void> | void;
  filterPredicate?: (event: SidraEvent) => boolean;
  priority: EventPriority;
  createdAt: string;
}

export interface DeadLetterItem {
  id: string;
  event: SidraEvent;
  failureReason: string;
  failedAt: string;
  retryAttempts: number;
}

export interface ReplayRequest {
  topicPattern?: string;
  startTime?: string;
  endTime?: string;
  correlationId?: string;
  limit?: number;
}

export interface EventBusMetrics {
  eventsPerSec: number;
  totalPublishedCount: number;
  totalDeliveredCount: number;
  totalRetriesCount: number;
  deadLetterCount: number;
  totalReplayCount: number;
  subscriberCount: number;
  queueDepthTotal: number;
  averageDeliveryLatencyMs: number;
  retentionUsageMB: number;
}
