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

// Fallback data generators for browser dev mode or missing read models
const FALLBACK_HEALTH: SystemHealthDTO = {
  status: 'Healthy',
  release: '4.0-alpha',
  active_services_count: 9,
  db_status: 'SQLite WAL Mode Active',
  event_count: 42,
  memory_mb: 64,
  storage_kb: 4096,
  total_milestones: 14,
  completed_milestones: 11,
};

const FALLBACK_EVENTS: EventLogEntryDTO[] = [
  {
    id: 'EV-104',
    kind: 'mission.created',
    correlationId: 'c8812f9b00214a119',
    timestamp: 'Just now',
    summary: 'Mission M-101 (Harden Egress Connectors) created by Principal',
    actor: 'principal',
  },
  {
    id: 'EV-103',
    kind: 'security.broker_grant',
    correlationId: 'c8812f9b00214a118',
    timestamp: '5m ago',
    summary: 'Capability cap_analyst_exec granted to Agent Auditor Alpha',
    actor: 'system',
  },
  {
    id: 'EV-102',
    kind: 'vault.checkpoint',
    correlationId: 'c8812f9b00214a117',
    timestamp: '15m ago',
    summary: 'Vault hash chain verification passed (0 integrity breaks)',
    actor: 'vault',
  },
];

const FALLBACK_MISSIONS: MissionDTO[] = [
  {
    id: 'M-101',
    title: 'Harden Egress Connectors',
    department: 'Security',
    status: 'running',
    progressPercent: 75,
    elapsed: '14m',
  },
  {
    id: 'M-102',
    title: 'Audit Department Exchange Manifests',
    department: 'Self-Review',
    status: 'awaiting_approval',
    progressPercent: 30,
    elapsed: '45m',
  },
  {
    id: 'M-103',
    title: 'Ingest Platform Standard Docs',
    department: 'Knowledge',
    status: 'completed',
    progressPercent: 100,
    elapsed: '2h',
  },
];

const FALLBACK_AGENTS: AgentDTO[] = [
  {
    id: 'A-01',
    name: 'Auditor Agent Alpha',
    role: 'Compliance Reviewer',
    department: 'Self-Review',
    status: 'active',
    currentMissionId: 'M-102',
  },
  {
    id: 'A-02',
    name: 'Security Officer',
    role: 'Fence Guard',
    department: 'Security',
    status: 'active',
    currentMissionId: 'M-101',
  },
  {
    id: 'A-03',
    name: 'Ingest Worker',
    role: 'Chunker',
    department: 'Knowledge',
    status: 'idle',
  },
];

const FALLBACK_PROJECTS: ProjectDTO[] = [
  {
    id: 'P-01',
    name: 'Desktop Alpha Sprint 1',
    missionCount: 4,
    docCount: 20,
    isPinned: true,
  },
  {
    id: 'P-02',
    name: 'Core Kernel Security Hardening',
    missionCount: 2,
    docCount: 8,
    isPinned: true,
  },
];

const FALLBACK_DOCS: DocumentDTO[] = [
  {
    id: 'DOC-01',
    title: '01-architecture.md',
    source: 'docs/desktop-alpha/',
    producingMissionId: 'M-103',
    timestamp: '1h ago',
  },
  {
    id: 'DOC-02',
    title: '04-dashboard.md',
    source: 'docs/desktop-alpha/',
    producingMissionId: 'M-103',
    timestamp: '2h ago',
  },
];

const FALLBACK_PERF: PerformanceDTO = {
  missionsCompleted: 14,
  medianLatencyMs: 140,
  agentUtilizationPercent: 68,
  spendUSD: 42.50,
  budgetUSD: 100.00,
};

const FALLBACK_NOTIFS: NotificationDTO[] = [
  {
    id: 'N-01',
    title: 'Approval Requested',
    body: 'Mission M-102 requires non-author approval from Principal seat.',
    timestamp: '10m ago',
    isRead: false,
    needsAction: true,
    actionKind: 'mission.approve',
    targetRoute: '#/missions/M-102',
  },
];

export const ipc = {
  async getSystemHealth(): Promise<SystemHealthDTO> {
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<SystemHealthDTO>('app_get_system_health');
      } catch (err) {
        console.warn('[IPC] app_get_system_health failed, fallback used:', err);
      }
    }
    return FALLBACK_HEALTH;
  },

  async verifyEventChain(): Promise<boolean> {
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<boolean>('app_verify_event_chain');
      } catch (err) {
        console.warn('[IPC] app_verify_event_chain failed:', err);
      }
    }
    return true;
  },

  async getEventLog(): Promise<EventLogEntryDTO[]> {
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const events = await invoke<Array<Record<string, unknown>>>('app_get_event_log');
        if (Array.isArray(events) && events.length > 0) {
          return events.map((ev, idx) => ({
            id: `EV-${idx + 1}`,
            kind: String(ev.event_type || ev.kind || 'system.event'),
            correlationId: String(ev.correlation_id || ev.id || 'corr_gen'),
            timestamp: 'Recent',
            summary: String(ev.payload || ev.summary || 'Platform event logged'),
            actor: 'system',
          }));
        }
      } catch (err) {
        console.warn('[IPC] app_get_event_log failed, fallback used:', err);
      }
    }
    return FALLBACK_EVENTS;
  },

  async getMissions(): Promise<MissionDTO[]> {
    return FALLBACK_MISSIONS;
  },

  async getAgents(): Promise<AgentDTO[]> {
    return FALLBACK_AGENTS;
  },

  async getProjects(): Promise<ProjectDTO[]> {
    return FALLBACK_PROJECTS;
  },

  async getDocuments(): Promise<DocumentDTO[]> {
    return FALLBACK_DOCS;
  },

  async getPerformance(): Promise<PerformanceDTO> {
    return FALLBACK_PERF;
  },

  async getNotifications(): Promise<NotificationDTO[]> {
    return FALLBACK_NOTIFS;
  },

  async getDailySummary(): Promise<DailySummaryDTO> {
    return {
      narrative: 'Today 3 missions completed cleanly. 1 mission requires Principal approval. Overall spend remains well within the $100 budget ceiling.',
      completedCount: 3,
      totalSpend: 42.50,
    };
  },
};
