import {
  DecisionCandidate,
  ScoringWeights,
  CandidateScoreBreakdown,
} from './types';

export class ScoringEngine {
  private static defaultWeights: ScoringWeights = {
    priorityWeight: 1.5,
    costWeight: 1.2,
    riskWeight: 1.8,
    confidenceWeight: 2.0,
    latencyWeight: 1.0,
    complexityWeight: 0.8,
    policyComplianceWeight: 2.5,
    businessValueWeight: 1.6,
  };

  public static scoreCandidates(
    candidates: DecisionCandidate[],
    customWeights?: Partial<ScoringWeights>,
    constraintViolationsMap: Map<string, string[]> = new Map(),
    policyViolationsMap: Map<string, string[]> = new Map()
  ): CandidateScoreBreakdown[] {
    const weights: ScoringWeights = { ...this.defaultWeights, ...customWeights };
    const totalWeight =
      weights.priorityWeight +
      weights.costWeight +
      weights.riskWeight +
      weights.confidenceWeight +
      weights.latencyWeight +
      weights.complexityWeight +
      weights.policyComplianceWeight +
      weights.businessValueWeight;

    return candidates.map((cand) => {
      const cViolations = constraintViolationsMap.get(cand.id) || [];
      const pViolations = policyViolationsMap.get(cand.id) || [];
      const hasHardViolations = cViolations.length > 0 || pViolations.length > 0;

      // 1. Cost Score (Lower cost is better)
      const costScore = Math.max(0, 100 - (cand.estimatedCost || 0) * 10);

      // 2. Risk Score (Lower risk is better)
      const riskScore = Math.max(0, 100 - (cand.estimatedRisk || 0));

      // 3. Latency Score (Lower latency is better)
      const latencyScore = Math.max(0, 100 - (cand.estimatedLatencyMs || 0) / 50);

      // 4. Confidence Score (Higher confidence is better)
      const confidenceScore = (cand.confidence || 0.8) * 100;

      // 5. Business Value Score (Higher value is better)
      const businessValueScore = cand.businessValue || 75;

      // 6. Policy Compliance Score
      const policyScore = hasHardViolations ? 0 : 100;

      // Weighted Multi-Criteria Sum
      const weightedSum =
        costScore * weights.costWeight +
        riskScore * weights.riskWeight +
        latencyScore * weights.latencyWeight +
        confidenceScore * weights.confidenceWeight +
        businessValueScore * weights.businessValueWeight +
        policyScore * weights.policyComplianceWeight;

      const rawScore = weightedSum / totalWeight;
      const finalRawScore = hasHardViolations ? Math.min(rawScore, 20) : rawScore;

      return {
        candidateId: cand.id,
        candidateName: cand.name,
        rawScore: Math.round(finalRawScore * 10) / 10,
        normalizedScore: Math.round((finalRawScore / 100) * 100) / 100,
        costScore: Math.round(costScore),
        riskScore: Math.round(riskScore),
        latencyScore: Math.round(latencyScore),
        confidenceScore: Math.round(confidenceScore),
        businessValueScore: Math.round(businessValueScore),
        policyViolations: pViolations,
        constraintViolations: cViolations,
        passed: !hasHardViolations,
      };
    });
  }
}
