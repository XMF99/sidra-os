import {
  DecisionRequest,
  DecisionCandidate,
  CandidateScoreBreakdown,
  DecisionExplanation,
} from './types';

export class ExplanationEngine {
  public static generateExplanation(
    request: DecisionRequest,
    selectedCandidate: DecisionCandidate | undefined,
    breakdowns: CandidateScoreBreakdown[],
    constraintsCount: number,
    policiesCount: number
  ): DecisionExplanation {
    breakdowns.sort((a, b) => b.rawScore - a.rawScore);

    const winnerBreakdown = breakdowns.find((b) => b.candidateId === selectedCandidate?.id);
    const finalScore = winnerBreakdown ? winnerBreakdown.rawScore : 0;
    const confidence = selectedCandidate ? selectedCandidate.confidence : 0;

    let rationale = '';
    if (selectedCandidate && winnerBreakdown && winnerBreakdown.passed) {
      rationale = `Candidate '${selectedCandidate.name}' selected with top score of ${finalScore}/100. It satisfied all ${constraintsCount} active constraints and passed all ${policiesCount} corporate policies while maintaining optimal risk ($${selectedCandidate.estimatedCost} cost, ${selectedCandidate.estimatedRisk}% risk).`;
    } else if (selectedCandidate) {
      rationale = `Candidate '${selectedCandidate.name}' selected with score ${finalScore}/100 despite conditional policy warnings (${winnerBreakdown?.policyViolations.join('; ')}).`;
    } else {
      rationale = `Decision REJECTED: None of the ${request.candidates.length} candidates satisfied active organizational constraints and policies.`;
    }

    return {
      requestId: request.id,
      decisionType: request.decisionType,
      inputs: request.context,
      alternativesCount: request.candidates.length,
      selectedCandidateId: selectedCandidate?.id || 'none',
      selectedCandidateName: selectedCandidate?.name || 'None Selected',
      finalScore,
      confidence,
      rationale,
      constraintsEvaluated: constraintsCount,
      policiesValidated: policiesCount,
      candidatesBreakdown: breakdowns,
    };
  }
}
