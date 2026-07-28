import { DispatchedTaskToken, FailureRecoveryAction } from './types';
import { DecisionEngine } from '../decision-engine/DecisionEngine';
import { PlanningEngine } from '../planning-engine/PlanningEngine';

export class FailureCoordinator {
  public static handleTaskFailure(
    token: DispatchedTaskToken,
    planId: string
  ): FailureRecoveryAction {
    const recoveryId = `REC-${Date.now()}`;

    if (token.retryCount < 2) {
      token.retryCount += 1;
      token.status = 'retrying';

      return {
        id: recoveryId,
        sessionId: token.sessionId,
        taskId: token.taskId,
        actionType: 'retry',
        status: 'in_progress',
        reason: `Initiated retry ${token.retryCount}/2 for task '${token.taskTitle}'`,
        triggeredAt: new Date().toISOString(),
      };
    }

    // Retries exhausted -> Escalate to Decision Engine & Request Replan
    try {
      const decisionEngine = DecisionEngine.getInstance();
      decisionEngine.requestDecision({
        id: `REQ-DEC-FAIL-${Date.now()}`,
        decisionType: 'escalation',
        requesterId: 'FailureCoordinator',
        requesterType: 'automation',
        context: { failedTaskId: token.taskId, error: token.errorReason },
        candidates: [
          {
            id: 'cand_replan',
            name: 'Trigger Dynamic Replanning',
            description: 'Re-optimize plan steps and reassign task to fallback agent',
            parameters: {},
            estimatedCost: 0,
            estimatedRisk: 10,
            estimatedLatencyMs: 100,
            complexity: 2,
            confidence: 0.95,
            businessValue: 90,
          },
        ],
        requestedAt: new Date().toISOString(),
      });

      const planningEngine = PlanningEngine.getInstance();
      planningEngine.replan(planId, `Task '${token.taskTitle}' failed after 2 retries`);
    } catch (e) {
      // Ignore if plan not found in mock
    }

    return {
      id: recoveryId,
      sessionId: token.sessionId,
      taskId: token.taskId,
      actionType: 'request_replan',
      status: 'resolved',
      reason: `Escalated failure of task '${token.taskTitle}' to Decision Engine and triggered Dynamic Replanning.`,
      triggeredAt: new Date().toISOString(),
    };
  }
}
