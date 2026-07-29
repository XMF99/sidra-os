import { create } from 'zustand';
import { RoomId } from '@sidra/ui';

interface ShellState {
  activeRoom: RoomId;
  setActiveRoom: (room: RoomId) => void;
  developerMode: boolean;
  setDeveloperMode: (enabled: boolean) => void;
  toggleDeveloperMode: () => void;
  isProjectWizardOpen: boolean;
  setProjectWizardOpen: (open: boolean) => void;
  isMissionWizardOpen: boolean;
  setMissionWizardOpen: (open: boolean) => void;
  selectedProjectTemplate?: string;
  openProjectWizardWithTemplate: (template?: string) => void;
  rightPanelOpen: boolean;
  setRightPanelOpen: (open: boolean) => void;
  toggleRightPanel: () => void;
  isUniversalSearchOpen: boolean;
  setUniversalSearchOpen: (open: boolean) => void;
  activeProjectWorkspaceId: string | null;
  openProjectWorkspace: (id: string) => void;
  closeProjectWorkspace: () => void;
}

const getInitialDevMode = (): boolean => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('sidra_dev_mode') === 'true';
  }
  return false;
};

export const useShellStore = create<ShellState>((set) => ({
  activeRoom: 'lobby',
  setActiveRoom: (room) => set({ activeRoom: room }),
  developerMode: getInitialDevMode(),
  setDeveloperMode: (enabled) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('sidra_dev_mode', String(enabled));
    }
    set({ developerMode: enabled });
  },
  toggleDeveloperMode: () => {
    set((state) => {
      const next = !state.developerMode;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('sidra_dev_mode', String(next));
      }
      return { developerMode: next };
    });
  },
  isProjectWizardOpen: false,
  setProjectWizardOpen: (open) => set({ isProjectWizardOpen: open }),
  isMissionWizardOpen: false,
  setMissionWizardOpen: (open) => set({ isMissionWizardOpen: open }),
  selectedProjectTemplate: undefined,
  openProjectWizardWithTemplate: (template) =>
    set({ isProjectWizardOpen: true, selectedProjectTemplate: template }),
  rightPanelOpen: true,
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  isUniversalSearchOpen: false,
  setUniversalSearchOpen: (open) => set({ isUniversalSearchOpen: open }),
  activeProjectWorkspaceId: null,
  openProjectWorkspace: (id) => set({ activeProjectWorkspaceId: id }),
  closeProjectWorkspace: () => set({ activeProjectWorkspaceId: null }),
}));

