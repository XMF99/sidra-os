import { ExecutionState } from './types';

export class ExecutionStateMachine {
  private static validTransitions: Record<ExecutionState, ExecutionState[]> = {
    created: ['queued', 'preparing', 'cancelled'],
    queued: ['preparing', 'running', 'cancelled'],
    preparing: ['running', 'blocked', 'cancelled'],
    running: ['waiting', 'paused', 'blocked', 'retrying', 'recovering', 'completed', 'failed', 'cancelled'],
    waiting: ['running', 'blocked', 'failed', 'cancelled'],
    paused: ['running', 'cancelled'],
    blocked: ['running', 'retrying', 'recovering', 'failed', 'cancelled'],
    retrying: ['running', 'recovering', 'failed', 'cancelled'],
    recovering: ['running', 'completed', 'failed', 'cancelled'],
    completed: ['archived'],
    cancelled: ['archived'],
    failed: ['recovering', 'archived'],
    archived: ['created'],
  };

  public static validateTransition(from: ExecutionState, to: ExecutionState): void {
    const allowed = ExecutionStateMachine.validTransitions[from] || [];
    if (!allowed.includes(to)) {
      throw new Error(`Invalid Execution state transition from '${from}' to '${to}'.`);
    }
  }
}
