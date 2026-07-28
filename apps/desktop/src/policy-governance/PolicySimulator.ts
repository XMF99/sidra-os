import {
  PolicyDefinition,
  PolicyEvaluationContext,
  PolicyResult,
  PolicySimulationResult,
} from './types';
import { RuleEvaluator } from './RuleEvaluator';

export class PolicySimulator {
  public static simulateScenario(
    scenarioName: string,
    policies: PolicyDefinition[],
    context: PolicyEvaluationContext,
    expectedResult: PolicyResult
  ): PolicySimulationResult {
    const startTime = Date.now();
    const simId = `SIM-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    let actualResult: PolicyResult = 'allow';

    // Evaluate against provided policies
    for (const pol of policies) {
      if (pol.active) {
        const res = RuleEvaluator.evaluatePolicy(pol, context);
        if (res.decision !== 'allow') {
          actualResult = res.decision;
          break;
        }
      }
    }

    const duration = Date.now() - startTime;
    const matched = actualResult === expectedResult;

    return {
      simulationId: simId,
      scenarioName,
      expectedResult,
      actualResult,
      matched,
      durationMs: duration,
      evaluatedPoliciesCount: policies.length,
    };
  }
}
