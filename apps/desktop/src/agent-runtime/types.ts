export type AgentState =
  | 'created'
  | 'initialized'
  | 'ready'
  | 'assigned'
  | 'running'
  | 'waiting'
  | 'paused'
  | 'blocked'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'offline'
  | 'archived';

export type AgentHealth = 'healthy' | 'degraded' | 'unresponsive' | 'failed';

export type AgentCapability =
  | 'coding'
  | 'planning'
  | 'documentation'
  | 'research'
  | 'design'
  | 'finance'
  | 'hr'
  | 'marketing'
  | 'translation'
  | 'analysis'
  | 'search'
  | 'vision'
  | 'speech'
  | '3d_modeling'
  | 'security_audit'
  | string;

export interface AgentSkill {
  id: string;
  name: string;
  category: string;
  proficiency: number; // 0 to 100
  description: string;
}

export interface AgentPermission {
  id: string;
  scope: string; // e.g. "connectors:gdrive:read", "workflows:execute"
  grantedAt: string;
}

export interface AgentMemoryReference {
  id: string;
  type: 'vector' | 'document' | 'history_log' | 'context';
  summary: string;
  referenceUri: string;
  score?: number;
}

export interface AgentProfile {
  title: string;
  avatarIcon?: string;
  bio: string;
  specialization: string;
  temperaturePreference?: number;
}

export interface AgentModel {
  id: string;
  name: string;
  department: string;
  role: string;
  profile: AgentProfile;
  skills: AgentSkill[];
  capabilities: AgentCapability[];
  permissions: AgentPermission[];
  memoryReferences: AgentMemoryReference[];
  priority: number;
  maxConcurrency: number;
  currentMissionId?: string;
  currentWorkflowId?: string;
  currentAutomationId?: string;
  state: AgentState;
  health: AgentHealth;
  version: string;
  metadata: Record<string, unknown>;
  lastHeartbeatAt: string;
  uptimeSeconds: number;
  assignedTasksCount: number;
  completedTasksCount: number;
}

export interface AgentTemplate {
  id: string;
  name: string;
  department: string;
  role: string;
  profile: AgentProfile;
  defaultCapabilities: AgentCapability[];
  defaultSkills: AgentSkill[];
  priority: number;
  maxConcurrency: number;
}

export interface AgentSupervisionPolicy {
  heartbeatIntervalMs: number;
  timeoutThresholdMs: number;
  autoRecoveryEnabled: boolean;
  maxConsecutiveFailures: number;
}

export interface AgentMailboxItem {
  id: string;
  agentId: string;
  senderAgentId?: string;
  missionId?: string;
  type: 'mission.execute' | 'workflow.step' | 'automation.trigger' | 'capability.request' | 'agent.delegate' | 'agent.escalate';
  payload: unknown;
  status: 'queued' | 'processing' | 'completed' | 'rejected' | 'failed';
  createdAt: string;
}

export interface AgentMetrics {
  totalAgents: number;
  activeAgents: number;
  healthyAgentsCount: number;
  unresponsiveAgentsCount: number;
  taskThroughputPerMin: number;
  averageResponseDurationMs: number;
  totalDelegatedTasks: number;
}

export interface AgentRuntimeEvent {
  id: string;
  type:
    | 'AgentRegistered'
    | 'AgentStarted'
    | 'AgentPaused'
    | 'AgentResumed'
    | 'AgentStopped'
    | 'AgentTerminated'
    | 'AgentBusy'
    | 'AgentIdle'
    | 'AgentFailed'
    | 'MissionAssigned'
    | 'WorkflowAssigned'
    | 'TaskDelegated'
    | 'TaskEscalated'
    | 'CapabilityRequested'
    | 'HeartbeatReceived'
    | 'AgentRecovered';
  agentId: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
