import { DecisionCandidate, DecisionPolicy } from './types';

export class PolicyEngine {
  public static validatePolicies(
    candidates: DecisionCandidate[],
    policies: DecisionPolicy[]
  ): Map<string, string[]> {
    const violationsMap = new Map<string, string[]>();

    candidates.forEach((cand) => {
      const violations: string[] = [];

      policies.forEach((pol) => {
        if (!pol.active) return;

        if (pol.disallowHighRisk && cand.estimatedRisk > 60) {
          violations.push(`Policy '${pol.name}': Disallows high-risk candidate (Risk: ${cand.estimatedRisk})`);
        }
        if (cand.confidence < pol.minConfidence) {
          violations.push(`Policy '${pol.name}': Confidence below policy threshold (${cand.confidence} < ${pol.minConfidence})`);
        }
      });

      violationsMap.set(cand.id, violations);
    });

    return violationsMap;
  }
}
