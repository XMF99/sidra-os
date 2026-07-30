import { create } from 'zustand';

export interface WorkspaceItem {
  id: string;
  name: string;
  departmentCount: number;
  lastActiveUtc: string;
}

interface WorkspaceState {
  workspaces: WorkspaceItem[];
  activeWorkspaceId: string;
  openWorkspace: (id: string) => void;
  closeWorkspace: (id: string) => void;
  createWorkspace: (name: string) => void;
}

const DEFAULT_WORKSPACES: WorkspaceItem[] = [
  { id: 'ws-main', name: 'Primary Organization', departmentCount: 5, lastActiveUtc: '2026-07-30T06:00:00Z' },
  { id: 'ws-dev', name: 'R&D Sandbox Workspace', departmentCount: 2, lastActiveUtc: '2026-07-30T04:30:00Z' },
];

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: DEFAULT_WORKSPACES,
  activeWorkspaceId: 'ws-main',

  openWorkspace: (id) =>
    set((state) => {
      if (state.workspaces.some((w) => w.id === id)) {
        return { activeWorkspaceId: id };
      }
      return state;
    }),

  closeWorkspace: (id) =>
    set((state) => {
      const filtered = state.workspaces.filter((w) => w.id !== id);
      const nextActive = state.activeWorkspaceId === id && filtered.length > 0 ? filtered[0].id : state.activeWorkspaceId;
      return { workspaces: filtered, activeWorkspaceId: nextActive };
    }),

  createWorkspace: (name) =>
    set((state) => {
      const newWs: WorkspaceItem = {
        id: `ws-${Date.now()}`,
        name,
        departmentCount: 1,
        lastActiveUtc: new Date().toISOString(),
      };
      return {
        workspaces: [...state.workspaces, newWs],
        activeWorkspaceId: newWs.id,
      };
    }),
}));
