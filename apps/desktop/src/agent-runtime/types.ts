export type AgentState =
  | 'offline'
  | 'starting'
  | 'idle'
  | 'busy'
  | 'waiting'
  | 'suspended'
  | 'stopping'
  | 'failed';

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
  | string;

export interface AgentModel {
  id: string;
  name: string;
  department: string;
  role: string;
  capabilities: AgentCapability[];
  priority: number;
  maxConcurrency: number;
  currentMissionId?: string;
  state: AgentState;
  health: AgentHealth;
  version: string;
  metadata: Record<string, unknown>;
  lastHeartbeatAt: string;
  uptimeSeconds: number;
}

export interface AgentMailboxItem {
  id: string;
  agentId: string;
  missionId: string;
  type: string;
  payload: unknown;
  status: 'queued' | 'processing' | 'completed' | 'rejected' | 'failed';
  createdAt: string;
}

export interface AgentRuntimeEvent {
  id: string;
  type:
    | 'AgentRegistered'
    | 'AgentStarted'
    | 'AgentStopped'
    | 'AgentBusy'
    | 'AgentIdle'
    | 'AgentFailed'
    | 'MissionAssigned'
    | 'MissionCompleted'
    | 'HeartbeatReceived';
  agentId: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
