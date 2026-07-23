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
  | 'task'
  | 'decision'
  | 'parallel'
  | 'merge'
  | 'delay'
  | 'approval'
  | 'loop'
  | 'end';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  title?: string;
  nextNodes?: string[];
  capability?: string;
  condition?: string;
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
  startNodeId: string;
  nodes: Map<string, WorkflowNode>;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  missionId: string;
  state: WorkflowState;
  currentNodeId: string;
  activeNodeIds: string[];
  variables: Record<string, unknown>;
  history: Array<{
    nodeId: string;
    state: string;
    timestamp: string;
    output?: unknown;
  }>;
  pendingApprovals?: string[];
  startedAt: string;
  completedAt?: string;
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
    | 'WorkflowCancelled'
    | 'WorkflowFailed'
    | 'CompensationStarted'
    | 'CompensationCompleted';
  workflowInstanceId: string;
  nodeId?: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
