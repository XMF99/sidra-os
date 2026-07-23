export type MissionState =
  | 'draft'
  | 'queued'
  | 'running'
  | 'paused'
  | 'waiting'
  | 'blocked'
  | 'completed'
  | 'cancelled'
  | 'failed';

export interface ExecutionContext {
  missionId: string;
  workspaceId: string;
  actorId: string;
  permissions: string[];
  variables: Record<string, unknown>;
  environment: Record<string, string>;
  correlationId: string;
  traceId: string;
  executionTime: string;
}

export interface QueueItem {
  missionId: string;
  context: ExecutionContext;
  priority: number;
  dependencies: string[];
  enqueuedAt: string;
}

export interface RuntimeEvent {
  id: string;
  type: string;
  missionId: string;
  correlationId: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}

export interface MissionRunRecord {
  id: string;
  title: string;
  state: MissionState;
  context: ExecutionContext;
  progressPercent: number;
  result?: unknown;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
