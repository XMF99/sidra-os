import { WorkflowState } from './types';

export class InvalidWorkflowStateTransitionError extends Error {
  constructor(from: WorkflowState, to: WorkflowState) {
    super(`Invalid workflow state transition from '${from}' to '${to}'`);
    this.name = 'InvalidWorkflowStateTransitionError';
  }
}

export class WorkflowStateMachine {
  private static VALID_TRANSITIONS: Record<WorkflowState, WorkflowState[]> = {
    draft: ['ready', 'cancelled'],
    ready: ['running', 'cancelled'],
    running: ['waiting', 'paused', 'completed', 'failed', 'compensating', 'cancelled'],
    waiting: ['running', 'failed', 'cancelled'],
    paused: ['running', 'cancelled'],
    compensating: ['failed', 'cancelled'],
    completed: [], // terminal
    cancelled: [], // terminal
    failed: ['ready', 'draft'], // retry transitions
  };

  public static canTransition(from: WorkflowState, to: WorkflowState): boolean {
    const allowed = WorkflowStateMachine.VALID_TRANSITIONS[from] || [];
    return allowed.includes(to);
  }

  public static validateTransition(from: WorkflowState, to: WorkflowState): void {
    if (!WorkflowStateMachine.canTransition(from, to)) {
      throw new InvalidWorkflowStateTransitionError(from, to);
    }
  }
}
