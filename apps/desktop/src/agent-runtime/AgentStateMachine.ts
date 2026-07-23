import { AgentState } from './types';

export class InvalidAgentStateTransitionError extends Error {
  constructor(from: AgentState, to: AgentState) {
    super(`Invalid agent state transition from '${from}' to '${to}'`);
    this.name = 'InvalidAgentStateTransitionError';
  }
}

export class AgentStateMachine {
  private static VALID_TRANSITIONS: Record<AgentState, AgentState[]> = {
    offline: ['starting'],
    starting: ['idle', 'failed'],
    idle: ['busy', 'suspended', 'stopping'],
    busy: ['idle', 'waiting', 'failed', 'suspended'],
    waiting: ['busy', 'idle', 'failed'],
    suspended: ['idle', 'stopping'],
    stopping: ['offline'],
    failed: ['starting', 'offline'],
  };

  public static canTransition(from: AgentState, to: AgentState): boolean {
    const allowed = AgentStateMachine.VALID_TRANSITIONS[from] || [];
    return allowed.includes(to);
  }

  public static validateTransition(from: AgentState, to: AgentState): void {
    if (!AgentStateMachine.canTransition(from, to)) {
      throw new InvalidAgentStateTransitionError(from, to);
    }
  }
}
