export type MissionState =
  | 'draft'
  | 'planned'
  | 'ready'
  | 'running'
  | 'paused'
  | 'waiting'
  | 'blocked'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'archived';

export interface MissionObjective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  assignedAgentId?: string;
  linkedWorkflowId?: string;
  linkedAutomationId?: string;
}

export interface MissionMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  objectives: MissionObjective[];
}

export interface MissionDeliverable {
  id: string;
  name: string;
  type: 'document' | 'code' | 'asset' | 'report' | 'deployment';
  pathOrUrl?: string;
  status: 'pending' | 'ready' | 'verified';
}

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
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  state: MissionState;
  context: ExecutionContext;
  progressPercent: number;
  milestones: MissionMilestone[];
  deliverables: MissionDeliverable[];
  assignedAgentIds: string[];
  linkedWorkflowIds: string[];
  linkedAutomationIds: string[];
  requiredConnectorIds: string[];
  dependencies: string[];
  deadline?: string;
  estimatedHoursRemaining?: number;
  result?: unknown;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface MissionTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  milestones: Omit<MissionMilestone, 'id'>[];
  defaultWorkflowIds: string[];
  defaultAutomationIds: string[];
  requiredConnectorIds: string[];
  defaultAgentCapabilities: string[];
}

export interface MissionMetrics {
  totalMissions: number;
  activeMissions: number;
  completedMissions: number;
  failedMissions: number;
  blockedMissions: number;
  successRate: number;
  averageCompletionTimeHours: number;
  missionThroughputPerWeek: number;
}
