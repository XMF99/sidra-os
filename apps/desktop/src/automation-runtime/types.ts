export type AutomationState =
  | 'idle'
  | 'scheduled'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'cancelled'
  | 'timeout'
  | 'retrying';

export type AutomationTriggerType =
  | 'manual'
  | 'time'
  | 'schedule'
  | 'cron'
  | 'connector_event'
  | 'mission_event'
  | 'workflow_event'
  | 'agent_event'
  | 'user_action'
  | 'system_event'
  | 'file_event'
  | 'webhook'
  | 'api_call';

export type AutomationActionType =
  | 'execute_mission'
  | 'execute_workflow'
  | 'execute_agent'
  | 'execute_connector_capability'
  | 'invoke_ai_model'
  | 'send_notification'
  | 'file_operation'
  | 'http_request'
  | 'run_script'
  | 'execute_command';

export interface TriggerConfig {
  type: AutomationTriggerType;
  schedulePattern?: string; // e.g. "0 * * * *" or "interval_30s"
  eventFilter?: string;
  sourceConnectorId?: string;
  sourceMissionId?: string;
  sourceWorkflowId?: string;
  webhookUrl?: string;
  filePath?: string;
}

export interface ActionConfig {
  type: AutomationActionType;
  targetId?: string; // e.g., missionId, workflowId, agentId, connectorId
  capability?: string;
  payload?: Record<string, unknown>;
  scriptContent?: string;
  commandString?: string;
  httpUrl?: string;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  notificationTitle?: string;
  notificationMessage?: string;
}

export interface RetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  backoffFactor: number;
  retryOnFailureTypes?: string[];
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  state: AutomationState;
  trigger: TriggerConfig;
  actions: ActionConfig[];
  dependencies?: string[]; // IDs of automations that must finish before this runs
  retryPolicy?: RetryPolicy;
  timeoutMs?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  executionMode: 'parallel' | 'sequential';
  createdAt: string;
  lastRunAt?: string;
  nextRunAt?: string;
  tags?: string[];
}

export interface ExecutionQueueItem {
  jobId: string;
  automationId: string;
  automationName: string;
  state: AutomationState;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actions: ActionConfig[];
  currentStepIndex: number;
  totalSteps: number;
  queuedAt: string;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
  retryCount: number;
  logs: string[];
}

export interface AutomationMetrics {
  totalAutomations: number;
  activeAutomations: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  queuedJobsCount: number;
  averageExecutionDurationMs: number;
  lastExecutionTime?: string;
}

export interface AutomationLog {
  id: string;
  automationId: string;
  jobId: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AutomationEvent {
  id: string;
  type:
    | 'AutomationCreated'
    | 'AutomationTriggered'
    | 'AutomationQueued'
    | 'AutomationStarted'
    | 'AutomationStepCompleted'
    | 'AutomationCompleted'
    | 'AutomationFailed'
    | 'AutomationPaused'
    | 'AutomationResumed'
    | 'AutomationCancelled';
  automationId: string;
  jobId?: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
