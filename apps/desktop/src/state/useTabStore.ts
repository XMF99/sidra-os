import { create } from 'zustand';

export interface TabItem {
  id: string;
  title: string;
  path: string;
  icon?: string;
  pinned?: boolean;
  closable?: boolean;
}

interface TabState {
  tabs: TabItem[];
  activeTabId: string;
  openTab: (tab: Omit<TabItem, 'pinned' | 'closable'> & { pinned?: boolean; closable?: boolean }) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  togglePinTab: (id: string) => void;
  reorderTabs: (startIndex: number, endIndex: number) => void;
}

const DEFAULT_TABS: TabItem[] = [
  { id: 'dashboard', title: 'Dashboard', path: '/', pinned: true, closable: false },
  { id: 'workspace', title: 'AI Workspace', path: '/workspace', pinned: false, closable: true },
];

export const useTabStore = create<TabState>((set) => ({
  tabs: DEFAULT_TABS,
  activeTabId: 'dashboard',

  openTab: (tabData) =>
    set((state) => {
      const existing = state.tabs.find((t) => t.id === tabData.id || t.path === tabData.path);
      if (existing) {
        return { activeTabId: existing.id };
      }
      const newTab: TabItem = {
        pinned: false,
        closable: true,
        ...tabData,
      };
      return {
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
      };
    }),

  closeTab: (id) =>
    set((state) => {
      const tabToClose = state.tabs.find((t) => t.id === id);
      if (!tabToClose || tabToClose.closable === false) {
        return state;
      }
      const newTabs = state.tabs.filter((t) => t.id !== id);
      let newActiveId = state.activeTabId;
      if (state.activeTabId === id && newTabs.length > 0) {
        newActiveId = newTabs[newTabs.length - 1].id;
      }
      return {
        tabs: newTabs,
        activeTabId: newActiveId,
      };
    }),

  setActiveTab: (id) =>
    set((state) => {
      if (state.tabs.some((t) => t.id === id)) {
        return { activeTabId: id };
      }
      return state;
    }),

  togglePinTab: (id) =>
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === id ? { ...t, pinned: !t.pinned } : t
      ),
    })),

  reorderTabs: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.tabs);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { tabs: result };
    }),
}));
