export interface SystemInfo {
  version: string;
  platform: string;
  status: 'Ready' | 'Busy' | 'Degraded';
}

export interface TaskStep {
  id: string;
  description: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Failed';
}

export interface TaskPlan {
  goal: string;
  tasks: TaskStep[];
}

export interface AgentMessage {
  agent_id: string;
  role: string;
  content: string;
  timestamp: number;
}

export interface Event {
  id: string;
  timestamp: number;
  actor: string;
  event_type: string;
  payload: string;
}
