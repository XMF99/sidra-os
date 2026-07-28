import { DecisionCandidate, DecisionConstraint } from './types';

export class ConstraintEngine {
  public static evaluateConstraints(
    candidates: DecisionCandidate[],
    constraints: DecisionConstraint[]
  ): Map<string, string[]> {
    const violationsMap = new Map<string, string[]>();

    candidates.forEach((cand) => {
      const violations: string[] = [];

      constraints.forEach((cons) => {
        if (cons.maxCost !== undefined && cand.estimatedCost > cons.maxCost) {
          violations.push(`Exceeds max budget constraint ($${cand.estimatedCost} > $${cons.maxCost})`);
        }
        if (cons.maxRisk !== undefined && cand.estimatedRisk > cons.maxRisk) {
          violations.push(`Exceeds max risk threshold (${cand.estimatedRisk} > ${cons.maxRisk})`);
        }
        if (cons.maxLatencyMs !== undefined && cand.estimatedLatencyMs > cons.maxLatencyMs) {
          violations.push(`Exceeds max latency threshold (${cand.estimatedLatencyMs}ms > ${cons.maxLatencyMs}ms)`);
        }
      });

      violationsMap.set(cand.id, violations);
    });

    return violationsMap;
  }
}
