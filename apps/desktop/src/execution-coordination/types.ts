export type ExecutionState =
  | 'created'
  | 'queued'
  | 'preparing'
  | 'running'
  | 'waiting'
  | 'paused'
  | 'blocked'
  | 'retrying'
  | 'recovering'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'archived';

export type TaskDispatchRuntime = 'agent' | 'workflow' | 'automation' | 'connector' | 'mission';

export interface DispatchedTaskToken {
  id: string;
  sessionId: string;
  taskId: string;
  stageId: string;
  taskTitle: string;
  runtime: TaskDispatchRuntime;
  status: 'dispatched' | 'running' | 'completed' | 'failed' | 'retrying';
  priority: number;
  retryCount: number;
  dispatchedAt: string;
  completedAt?: string;
  resultPayload?: unknown;
  errorReason?: string;
}

export interface FailureRecoveryAction {
  id: string;
  sessionId: string;
  taskId: string;
  actionType: 'retry' | 'fallback_runtime' | 'escalate_decision' | 'request_replan';
  status: 'pending' | 'in_progress' | 'resolved' | 'failed';
  reason: string;
  triggeredAt: string;
}

export interface ExecutionSession {
  id: string;
  planId: string;
  planTitle: string;
  missionId?: string;
  state: ExecutionState;
  progressPercent: number; // 0 to 100
  currentStageId?: string;
  dispatchedTasks: DispatchedTaskToken[];
  completedTaskIds: string[];
  failedTaskIds: string[];
  activeRuntimes: TaskDispatchRuntime[];
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ExecutionMetrics {
  runningSessionsCount: number;
  completedSessionsCount: number;
  failedSessionsCount: number;
  averageExecutionDurationMs: number;
  runtimeUtilizationPercent: number;
  recoveryActionsCount: number;
  retryCount: number;
  taskThroughputPerMin: number;
  executionSuccessRatePercent: number;
}

export interface ExecutionEvent {
  id: string;
  type:
    | 'SessionCreated'
    | 'SessionStarted'
    | 'SessionPaused'
    | 'SessionResumed'
    | 'SessionCancelled'
    | 'TaskDispatched'
    | 'TaskCompleted'
    | 'TaskFailed'
    | 'TaskRetried'
    | 'RecoveryInitiated'
    | 'SessionCompleted'
    | 'SessionFailed';
  sessionId: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
