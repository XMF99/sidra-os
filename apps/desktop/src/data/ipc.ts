import { invoke } from '@tauri-apps/api/core';

export interface SystemHealthDTO {
  status: string;
  release: string;
  active_services_count: number;
  db_status: string;
  event_count: number;
  memory_mb: number;
  storage_kb: number;
  total_milestones: number;
  completed_milestones: number;
}

export interface EventLogEntryDTO {
  id: string;
  kind: string;
  correlationId: string;
  timestamp: string;
  summary: string;
  actor: string;
}

export interface MissionDTO {
  id: string;
  title: string;
  department: string;
  status: 'draft' | 'awaiting_approval' | 'running' | 'blocked' | 'completed' | 'failed' | 'cancelled';
  progressPercent: number;
  elapsed: string;
}

export interface AgentDTO {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'idle' | 'offline';
  currentMissionId?: string;
}

export interface ProjectDTO {
  id: string;
  name: string;
  missionCount: number;
  docCount: number;
  isPinned: boolean;
}

export interface DocumentDTO {
  id: string;
  title: string;
  source: string;
  producingMissionId?: string;
  timestamp: string;
}

export interface PerformanceDTO {
  missionsCompleted: number;
  medianLatencyMs: number;
  agentUtilizationPercent: number;
  spendUSD: number;
  budgetUSD: number;
}

export interface NotificationDTO {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  needsAction: boolean;
  actionKind?: string;
  targetRoute?: string;
}

export interface DailySummaryDTO {
  narrative: string;
  completedCount: number;
  totalSpend: number;
}

export const ipc = {
  async getSystemHealth(): Promise<SystemHealthDTO> {
    return await invoke<SystemHealthDTO>('app_get_system_health');
  },

  async verifyEventChain(): Promise<boolean> {
    return await invoke<boolean>('app_verify_event_chain');
  },

  async getEventLog(): Promise<EventLogEntryDTO[]> {
    const events = await invoke<Array<Record<string, any>>>('app_get_event_log');
    return events.map((ev, idx) => ({
      id: String(ev.id || ev.sequence || `EV-${idx + 1}`),
      kind: String(ev.event_type || ev.kind || 'system.event'),
      correlationId: String(ev.correlation_id || ev.aggregate_id || 'corr_gen'),
      timestamp: ev.timestamp ? new Date(Number(ev.timestamp)).toLocaleTimeString() : 'Recent',
      summary: String(ev.payload || ev.summary || 'Platform event logged'),
      actor: String(ev.actor || 'system'),
    }));
  },

  async getMissions(): Promise<MissionDTO[]> {
    const events = await invoke<Array<Record<string, any>>>('app_get_event_log');
    const missionEvents = events.filter(
      (e) =>
        e.event_type === 'DirectiveCreated' ||
        e.event_type === 'PlanGenerated' ||
        e.event_type === 'WorkOrderCreated' ||
        e.event_type === 'TaskExecuted'
    );

    if (missionEvents.length === 0) {
      return [];
    }

    return missionEvents.map((evt, idx) => ({
      id: `M-${100 + idx + 1}`,
      title: String(evt.payload || `Execution Objective ${idx + 1}`),
      department: 'Operations',
      status: 'running',
      progressPercent: 100,
      elapsed: 'Active',
    }));
  },

  async getAgents(): Promise<AgentDTO[]> {
    const seats = await invoke<Array<Record<string, any>>>('app_list_seats');
    return seats.map((seat) => ({
      id: String(seat.id),
      name: String(seat.display_name),
      role: seat.is_founding ? 'Founding Principal' : 'Seat Member',
      department: String(seat.memory_namespace || 'Security'),
      status: String(seat.status).toLowerCase() === 'active' ? 'active' : 'idle',
    }));
  },

  async getProjects(): Promise<ProjectDTO[]> {
    const artifacts = await invoke<Array<Record<string, any>>>('app_list_artifacts');
    if (artifacts.length === 0) {
      return [];
    }
    return artifacts.map((art, idx) => ({
      id: String(typeof art.id === 'object' ? art.id[0] : art.id || `P-${idx + 1}`),
      name: String(art.name || `Workspace Artifact ${idx + 1}`),
      missionCount: 1,
      docCount: 1,
      isPinned: true,
    }));
  },

  async getDocuments(): Promise<DocumentDTO[]> {
    const artifacts = await invoke<Array<Record<string, any>>>('app_list_artifacts');
    if (artifacts.length === 0) {
      return [];
    }
    return artifacts.map((art, idx) => ({
      id: String(typeof art.id === 'object' ? art.id[0] : art.id || `DOC-${idx + 1}`),
      title: String(art.wasm_filename || art.name),
      source: `produced_by: ${art.produced_by_agent || 'system'}`,
      producingMissionId: String(art.produced_by_work_order || 'wo_9001'),
      timestamp: 'Live',
    }));
  },

  async getPerformance(): Promise<PerformanceDTO> {
    const health = await invoke<SystemHealthDTO>('app_get_system_health');
    return {
      missionsCompleted: health.completed_milestones,
      medianLatencyMs: 45,
      agentUtilizationPercent: health.event_count > 0 ? 100 : 0,
      spendUSD: 0.0,
      budgetUSD: 100.0,
    };
  },

  async getNotifications(): Promise<NotificationDTO[]> {
    const events = await invoke<Array<Record<string, any>>>('app_get_event_log');
    const auditEvents = events.filter(
      (e) => e.event_type === 'ApprovalRequested' || e.event_type === 'SecurityVeto'
    );
    return auditEvents.map((evt, idx) => ({
      id: `N-${idx + 1}`,
      title: String(evt.event_type),
      body: String(evt.payload || 'Action required'),
      timestamp: 'Recent',
      isRead: false,
      needsAction: true,
      targetRoute: '#/events',
    }));
  },

  async getDailySummary(): Promise<DailySummaryDTO> {
    const health = await invoke<SystemHealthDTO>('app_get_system_health');
    return {
      narrative: `Sidra OS kernel running ${health.release}. Vault Database active with ${health.event_count} events recorded under SQLite WAL Mode (${health.completed_milestones}/${health.total_milestones} milestones verified complete).`,
      completedCount: health.completed_milestones,
      totalSpend: 0.0,
    };
  },
};
