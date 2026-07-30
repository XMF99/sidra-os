import { create } from 'zustand';

export type UserIntentType =
  | 'Search'
  | 'Navigate'
  | 'Create'
  | 'Generate'
  | 'Analyze'
  | 'Install'
  | 'Explain'
  | 'Execute'
  | 'Conversation';

export interface TimelineEvent {
  id: string;
  type: 'mission' | 'blueprint' | 'capability' | 'space' | 'recommendation' | 'conversation' | 'knowledge';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

interface ContextEngineState {
  // Context Scope
  activeSpaceId: string | null;
  activeSpaceType: string | null;
  activeProjectId: string | null;
  activeProjectName: string | null;

  setContextScope: (scope: { spaceId?: string; spaceType?: string; projectId?: string; projectName?: string }) => void;

  // Intent Classification Engine
  classifyIntent: (query: string) => UserIntentType;

  // Demo Mode Isolation
  isDemoMode: boolean;
  enterDemoMode: () => void;
  leaveDemoMode: () => void;

  // Universal Timeline Events
  timelineEvents: TimelineEvent[];
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;

  // Command Center Modal (Ctrl+K)
  isCommandCenterOpen: boolean;
  openCommandCenter: () => void;
  closeCommandCenter: () => void;
  toggleCommandCenter: () => void;
}

const DEFAULT_TIMELINE_EVENTS: TimelineEvent[] = [
  { id: 'evt-1', type: 'space', title: 'Engineering Space Provisioned', description: 'Context isolation memory boundary set to Engineering Vault.', timestamp: new Date(Date.now() - 3600000).toISOString(), actor: 'System' },
  { id: 'evt-2', type: 'blueprint', title: 'Sovereign Enterprise Blueprint Saved', description: 'THEKY Confidence score evaluated at 98%.', timestamp: new Date(Date.now() - 1800000).toISOString(), actor: 'Chief Architect' },
  { id: 'evt-3', type: 'capability', title: 'Executive Task Planner Agent Installed', description: 'Installed via Capability Platform.', timestamp: new Date(Date.now() - 900000).toISOString(), actor: 'THEKY Installer' },
];

export const useContextEngineStore = create<ContextEngineState>((set) => ({
  activeSpaceId: 'space-eng',
  activeSpaceType: 'Engineering',
  activeProjectId: 'prj-alpha',
  activeProjectName: 'Sidra Kernel Optimization',

  setContextScope: (scope) =>
    set((state) => ({
      activeSpaceId: scope.spaceId !== undefined ? scope.spaceId : state.activeSpaceId,
      activeSpaceType: scope.spaceType !== undefined ? scope.spaceType : state.activeSpaceType,
      activeProjectId: scope.projectId !== undefined ? scope.projectId : state.activeProjectId,
      activeProjectName: scope.projectName !== undefined ? scope.projectName : state.activeProjectName,
    })),

  classifyIntent: (query) => {
    const q = query.trim().toLowerCase();
    if (q.startsWith('/') || q.startsWith('create') || q.startsWith('new') || q.startsWith('add')) return 'Create';
    if (q.startsWith('generate') || q.includes('want a') || q.includes('build a')) return 'Generate';
    if (q.startsWith('open') || q.startsWith('go to') || q.startsWith('show')) return 'Navigate';
    if (q.startsWith('install') || q.startsWith('get')) return 'Install';
    if (q.startsWith('analyze') || q.startsWith('audit') || q.startsWith('review')) return 'Analyze';
    if (q.startsWith('execute') || q.startsWith('run')) return 'Execute';
    if (q.startsWith('what') || q.startsWith('why') || q.startsWith('how')) return 'Explain';
    if (q.length > 20 || q.includes('?')) return 'Conversation';
    return 'Search';
  },

  isDemoMode: false,
  enterDemoMode: () => set({ isDemoMode: true }),
  leaveDemoMode: () => set({ isDemoMode: false }),

  timelineEvents: DEFAULT_TIMELINE_EVENTS,
  addTimelineEvent: (evt) =>
    set((state) => ({
      timelineEvents: [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          ...evt,
        },
        ...state.timelineEvents,
      ],
    })),

  isCommandCenterOpen: false,
  openCommandCenter: () => set({ isCommandCenterOpen: true }),
  closeCommandCenter: () => set({ isCommandCenterOpen: false }),
  toggleCommandCenter: () => set((state) => ({ isCommandCenterOpen: !state.isCommandCenterOpen })),
}));
