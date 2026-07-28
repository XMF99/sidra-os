export type WorkflowState =
  | 'draft'
  | 'ready'
  | 'running'
  | 'waiting'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'compensating';

export type NodeType =
  | 'start'
  | 'end'
  | 'task'
  | 'service_task'
  | 'human_task'
  | 'ai_task'
  | 'connector_task'
  | 'decision'
  | 'switch'
  | 'merge'
  | 'parallel'
  | 'delay'
  | 'timer'
  | 'event'
  | 'sub_workflow'
  | 'approval'
  | 'loop';

export interface HumanTaskConfig {
  assigneeRole?: string;
  assigneeUser?: string;
  approvalTitle?: string;
  approvalDescription?: string;
  timeoutMinutes?: number;
  autoApproveOnTimeout?: boolean;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  title?: string;
  nextNodes?: string[];
  capability?: string;
  connectorId?: string;
  subWorkflowId?: string;
  condition?: string;
  switchCases?: Record<string, string>; // caseValue -> targetNodeId
  humanTask?: HumanTaskConfig;
  compensationNodeId?: string;
  retryPolicy?: {
    maxRetries: number;
    delayMs: number;
  };
  timeoutMs?: number;
  metadata?: Record<string, unknown>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  startNodeId: string;
  nodes: Map<string, WorkflowNode>;
  category?: string;
  tags?: string[];
}

export interface WorkflowHistoryRecord {
  nodeId: string;
  state: string;
  timestamp: string;
  output?: unknown;
  durationMs?: number;
  actor?: string;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  version: string;
  missionId: string;
  state: WorkflowState;
  currentNodeId: string;
  activeNodeIds: string[];
  variables: Record<string, unknown>;
  history: WorkflowHistoryRecord[];
  pendingApprovals?: string[];
  startedAt: string;
  completedAt?: string;
  error?: string;
  retryCount?: number;
}

export interface WorkflowMetrics {
  totalDefinitions: number;
  totalInstances: number;
  activeInstances: number;
  completedInstances: number;
  failedInstances: number;
  pendingApprovalsCount: number;
  compensationsCount: number;
  averageDurationMs: number;
}

export interface WorkflowEvent {
  id: string;
  type:
    | 'WorkflowStarted'
    | 'NodeStarted'
    | 'NodeCompleted'
    | 'NodeFailed'
    | 'ApprovalRequested'
    | 'ApprovalGranted'
    | 'ApprovalRejected'
    | 'WorkflowCompleted'
    | 'WorkflowPaused'
    | 'WorkflowResumed'
    | 'WorkflowCancelled'
    | 'WorkflowFailed'
    | 'CompensationStarted'
    | 'CompensationCompleted';
  workflowInstanceId: string;
  nodeId?: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
