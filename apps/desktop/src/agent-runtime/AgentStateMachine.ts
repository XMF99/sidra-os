import { AgentState } from './types';

export class AgentStateMachine {
  private static validTransitions: Record<AgentState, AgentState[]> = {
    created: ['initialized', 'offline'],
    initialized: ['ready', 'offline'],
    ready: ['assigned', 'running', 'paused', 'offline'],
    assigned: ['running', 'waiting', 'blocked', 'cancelled'],
    running: ['waiting', 'paused', 'blocked', 'completed', 'failed', 'cancelled'],
    waiting: ['running', 'blocked', 'failed', 'cancelled'],
    paused: ['running', 'ready', 'cancelled'],
    blocked: ['running', 'waiting', 'failed', 'cancelled'],
    completed: ['ready', 'archived'],
    failed: ['initialized', 'ready', 'archived'],
    cancelled: ['ready', 'archived'],
    offline: ['created', 'initialized', 'ready'],
    archived: ['created'],
  };

  public static validateTransition(from: AgentState, to: AgentState): void {
    const allowed = AgentStateMachine.validTransitions[from] || [];
    if (!allowed.includes(to)) {
      throw new Error(`Invalid Agent state transition from '${from}' to '${to}'.`);
    }
  }
}
