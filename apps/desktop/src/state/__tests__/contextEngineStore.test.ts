import { describe, it, expect } from 'vitest';
import { useContextEngineStore } from '../useContextEngineStore';

describe('useContextEngineStore', () => {
  it('classifies user intent automatically without manual toggling', () => {
    const store = useContextEngineStore.getState();

    expect(store.classifyIntent('I want a game studio')).toBe('Generate');
    expect(store.classifyIntent('/create new project')).toBe('Create');
    expect(store.classifyIntent('go to settings')).toBe('Navigate');
    expect(store.classifyIntent('install dev console')).toBe('Install');
    expect(store.classifyIntent('analyze market risk')).toBe('Analyze');
    expect(store.classifyIntent('execute vault sync')).toBe('Execute');
    expect(store.classifyIntent('what is the system security policy?')).toBe('Explain');
  });

  it('manages active context scope', () => {
    const store = useContextEngineStore.getState();
    store.setContextScope({ spaceType: 'Marketing', projectName: 'Launch Campaign 2026' });

    expect(useContextEngineStore.getState().activeSpaceType).toBe('Marketing');
    expect(useContextEngineStore.getState().activeProjectName).toBe('Launch Campaign 2026');
  });

  it('isolates Demo Mode from production state', () => {
    const store = useContextEngineStore.getState();
    expect(store.isDemoMode).toBe(false);

    store.enterDemoMode();
    expect(useContextEngineStore.getState().isDemoMode).toBe(true);

    store.leaveDemoMode();
    expect(useContextEngineStore.getState().isDemoMode).toBe(false);
  });

  it('records Universal Timeline audit events', () => {
    const store = useContextEngineStore.getState();
    const initialCount = store.timelineEvents.length;

    store.addTimelineEvent({
      type: 'mission',
      title: 'Kernel Optimization Completed',
      description: 'Tokio task scheduler throughput benchmarked at 120k ops/sec.',
      actor: 'Sub-Agent Planner',
    });

    expect(useContextEngineStore.getState().timelineEvents.length).toBe(initialCount + 1);
  });

  it('toggles Global Command Center modal', () => {
    const store = useContextEngineStore.getState();
    expect(store.isCommandCenterOpen).toBe(false);

    store.toggleCommandCenter();
    expect(useContextEngineStore.getState().isCommandCenterOpen).toBe(true);
  });
});
