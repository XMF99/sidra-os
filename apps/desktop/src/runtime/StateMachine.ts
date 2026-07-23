import { MissionState } from './types';

export class InvalidStateTransitionError extends Error {
  constructor(from: MissionState, to: MissionState) {
    super(`Invalid state transition from '${from}' to '${to}'`);
    this.name = 'InvalidStateTransitionError';
  }
}

export class StateMachine {
  private static VALID_TRANSITIONS: Record<MissionState, MissionState[]> = {
    draft: ['queued', 'cancelled'],
    queued: ['running', 'blocked', 'cancelled'],
    running: ['paused', 'waiting', 'blocked', 'completed', 'failed', 'cancelled'],
    paused: ['running', 'cancelled'],
    waiting: ['running', 'cancelled'],
    blocked: ['queued', 'cancelled'],
    completed: [], // terminal
    cancelled: [], // terminal
    failed: ['queued', 'draft'], // retry transitions back to queued or draft
  };

  public static canTransition(from: MissionState, to: MissionState): boolean {
    const allowed = StateMachine.VALID_TRANSITIONS[from] || [];
    return allowed.includes(to);
  }

  public static validateTransition(from: MissionState, to: MissionState): void {
    if (!StateMachine.canTransition(from, to)) {
      throw new InvalidStateTransitionError(from, to);
    }
  }
}
