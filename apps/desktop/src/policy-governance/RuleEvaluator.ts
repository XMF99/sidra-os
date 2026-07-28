import {
  PolicyDefinition,
  PolicyEvaluationContext,
  PolicyEvaluationResult,
  PolicyResult,
} from './types';

export class RuleEvaluator {
  public static evaluatePolicy(
    policy: PolicyDefinition,
    context: PolicyEvaluationContext
  ): PolicyEvaluationResult {
    const startTime = Date.now();
    const evaluationId = `EVAL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const matchedRules: string[] = [];
    let decision: PolicyResult = 'allow';
    let reason = `Policy '${policy.name}' evaluated successfully. Action '${context.action}' allowed.`;

    // Sort rules by priority descending
    const sortedRules = [...policy.rules].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      if (RuleEvaluator.matchCondition(rule.condition, context)) {
        matchedRules.push(rule.id);
        decision = rule.action;
        reason = `Rule '${rule.name}' triggered action '${rule.action}' for context '${context.action}'.`;

        if (decision === 'deny' || decision === 'escalate') {
          break; // Stop evaluation on hard deny / escalation
        }
      }
    }

    const duration = Date.now() - startTime;
    const allowed = decision === 'allow' || decision === 'conditional_allow';

    return {
      evaluationId,
      policyId: policy.id,
      policyName: policy.name,
      decision,
      allowed,
      reason,
      explanation: `Evaluated ${sortedRules.length} rules under policy '${policy.name}' (v${policy.version}). Decision: ${decision.toUpperCase()}. Reason: ${reason}`,
      matchedRules,
      evaluatedAt: new Date().toISOString(),
      durationMs: duration,
    };
  }

  private static matchCondition(condition: string, context: PolicyEvaluationContext): boolean {
    if (condition === '*' || condition === 'true') return true;

    if (condition.includes('spendUSD >')) {
      const spend = Number(context.parameters?.spendUSD || 0);
      const threshold = Number(condition.split('>')[1]?.trim() || 100);
      return spend > threshold;
    }

    if (condition.includes('action ==')) {
      const targetAction = condition.split('==')[1]?.trim().replace(/'/g, '');
      return context.action === targetAction;
    }

    if (condition.includes('sourceRuntime ==')) {
      const targetRuntime = condition.split('==')[1]?.trim().replace(/'/g, '');
      return context.sourceRuntime === targetRuntime;
    }

    return true;
  }
}
