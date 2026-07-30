import { describe, it, expect } from 'vitest';
import { useAIWorkspaceStore } from '../useAIWorkspaceStore';

describe('useAIWorkspaceStore', () => {
  it('adds conversation message', () => {
    const store = useAIWorkspaceStore.getState();
    store.addMessage({ role: 'user', content: 'Test Prompt' });
    const state = useAIWorkspaceStore.getState();
    expect(state.messages.some((m) => m.content === 'Test Prompt')).toBe(true);
  });

  it('updates agent status and logs', () => {
    const store = useAIWorkspaceStore.getState();
    store.updateAgentStatus('agt-planner', 'executing', 50, 'Executing task DAG');
    const agent = useAIWorkspaceStore.getState().agents.find((a) => a.id === 'agt-planner');
    expect(agent?.status).toBe('executing');
    expect(agent?.progress).toBe(50);
  });

  it('approves executive decision', () => {
    const store = useAIWorkspaceStore.getState();
    store.approveDecision('dec-01');
    const decision = useAIWorkspaceStore.getState().decisions.find((d) => d.id === 'dec-01');
    expect(decision?.status).toBe('approved');
  });

  it('creates new mission', () => {
    const store = useAIWorkspaceStore.getState();
    store.createMission('Security Audit Mission', 'HIGH');
    const mission = useAIWorkspaceStore.getState().missions.find((m) => m.title === 'Security Audit Mission');
    expect(mission).toBeDefined();
    expect(mission?.priority).toBe('HIGH');
  });

  it('changes selected model and reasoning mode', () => {
    const store = useAIWorkspaceStore.getState();
    store.setSelectedModel('claude-3-5-sonnet');
    store.setReasoningMode('deep');
    expect(useAIWorkspaceStore.getState().selectedModelId).toBe('claude-3-5-sonnet');
    expect(useAIWorkspaceStore.getState().reasoningMode).toBe('deep');
  });
});
