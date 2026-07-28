import { MissionState } from './types';

export class StateMachine {
  private static validTransitions: Record<MissionState, MissionState[]> = {
    draft: ['planned', 'ready', 'cancelled'],
    planned: ['ready', 'running', 'cancelled'],
    ready: ['running', 'paused', 'cancelled'],
    running: ['paused', 'waiting', 'blocked', 'completed', 'failed', 'cancelled'],
    paused: ['running', 'cancelled'],
    waiting: ['running', 'blocked', 'cancelled', 'failed'],
    blocked: ['running', 'waiting', 'cancelled', 'failed'],
    completed: ['archived'],
    failed: ['draft', 'ready', 'running', 'archived'],
    cancelled: ['draft', 'archived'],
    archived: ['draft'],
  };

  public static validateTransition(from: MissionState, to: MissionState): void {
    const allowed = StateMachine.validTransitions[from] || [];
    if (!allowed.includes(to)) {
      throw new Error(`Invalid Mission state transition from '${from}' to '${to}'.`);
    }
  }
}
