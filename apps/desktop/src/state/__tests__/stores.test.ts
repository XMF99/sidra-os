import { describe, it, expect } from 'vitest';
import { useTabStore } from '../useTabStore';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { useSessionStore } from '../useSessionStore';
import { useModalStore } from '../useModalStore';
import { useNotificationStore } from '../useNotificationStore';

describe('useTabStore', () => {
  it('opens new tab and sets active ID', () => {
    const store = useTabStore.getState();
    store.openTab({ id: 'settings', title: 'Settings', path: '/settings' });
    expect(useTabStore.getState().activeTabId).toBe('settings');
    expect(useTabStore.getState().tabs.some((t) => t.id === 'settings')).toBe(true);
  });

  it('closes non-pinned tab', () => {
    const store = useTabStore.getState();
    store.openTab({ id: 'temp', title: 'Temp Tab', path: '/temp' });
    store.closeTab('temp');
    expect(useTabStore.getState().tabs.some((t) => t.id === 'temp')).toBe(false);
  });
});

describe('useWorkspaceStore', () => {
  it('creates new workspace', () => {
    const store = useWorkspaceStore.getState();
    store.createWorkspace('Finance Ops Workspace');
    const state = useWorkspaceStore.getState();
    expect(state.workspaces.some((w) => w.name === 'Finance Ops Workspace')).toBe(true);
  });
});

describe('useSessionStore', () => {
  it('locks and unlocks session', () => {
    const store = useSessionStore.getState();
    store.lockSession();
    expect(useSessionStore.getState().isLocked).toBe(true);

    store.unlockSession('1234');
    expect(useSessionStore.getState().isLocked).toBe(false);
  });
});

describe('useModalStore', () => {
  it('opens and closes confirm dialog', () => {
    const store = useModalStore.getState();
    store.openConfirm('Test Title', 'Test Message', () => {});
    expect(useModalStore.getState().confirmDialog?.isOpen).toBe(true);

    store.closeConfirm();
    expect(useModalStore.getState().confirmDialog).toBeNull();
  });
});

describe('useNotificationStore', () => {
  it('shows toast notification', () => {
    const store = useNotificationStore.getState();
    store.showToast({ type: 'success', title: 'Action Completed' });
    expect(useNotificationStore.getState().toasts.length).toBeGreaterThan(0);
    expect(useNotificationStore.getState().toasts[0].title).toBe('Action Completed');
  });
});
