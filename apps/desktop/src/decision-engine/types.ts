export type DecisionType =
  | 'strategic'
  | 'operational'
  | 'mission'
  | 'workflow'
  | 'agent'
  | 'scheduling'
  | 'resource_allocation'
  | 'connector_selection'
  | 'model_selection'
  | 'escalation'
  | 'approval'
  | 'risk';

export interface DecisionCandidate {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  estimatedCost: number; // in USD or resource tokens
  estimatedRisk: number; // 0 (low) to 100 (high)
  estimatedLatencyMs: number;
  complexity: number; // 1 (simple) to 10 (complex)
  confidence: number; // 0 to 1
  businessValue: number; // 0 to 100
  metadata?: Record<string, unknown>;
}

export interface DecisionConstraint {
  id: string;
  name: string;
  type: 'budget' | 'permission' | 'time' | 'resource' | 'policy' | 'compliance' | 'mission';
  description: string;
  maxCost?: number;
  maxRisk?: number;
  maxLatencyMs?: number;
  requiredPermission?: string;
}

export interface DecisionPolicy {
  id: string;
  name: string;
  category: 'organization' | 'security' | 'execution' | 'agent' | 'approval';
  description: string;
  active: boolean;
  minConfidence: number;
  disallowHighRisk: boolean;
}

export interface ScoringWeights {
  priorityWeight: number;
  costWeight: number;
  riskWeight: number;
  confidenceWeight: number;
  latencyWeight: number;
  complexityWeight: number;
  policyComplianceWeight: number;
  businessValueWeight: number;
}

export interface CandidateScoreBreakdown {
  candidateId: string;
  candidateName: string;
  rawScore: number; // 0 to 100
  normalizedScore: number; // 0 to 1
  costScore: number;
  riskScore: number;
  latencyScore: number;
  confidenceScore: number;
  businessValueScore: number;
  policyViolations: string[];
  constraintViolations: string[];
  passed: boolean;
}

export interface DecisionExplanation {
  requestId: string;
  decisionType: DecisionType;
  inputs: Record<string, unknown>;
  alternativesCount: number;
  selectedCandidateId: string;
  selectedCandidateName: string;
  finalScore: number;
  confidence: number;
  rationale: string;
  constraintsEvaluated: number;
  policiesValidated: number;
  candidatesBreakdown: CandidateScoreBreakdown[];
}

export interface DecisionRequest {
  id: string;
  decisionType: DecisionType;
  requesterId: string;
  requesterType: 'mission' | 'workflow' | 'automation' | 'agent' | 'connector' | 'user';
  context: Record<string, unknown>;
  candidates: DecisionCandidate[];
  customWeights?: Partial<ScoringWeights>;
  customConstraints?: DecisionConstraint[];
  requestedAt: string;
}

export interface DecisionResult {
  requestId: string;
  decisionType: DecisionType;
  status: 'approved' | 'rejected' | 'escalated' | 'conditional';
  selectedCandidate?: DecisionCandidate;
  selectedCandidateId?: string;
  score: number;
  confidence: number;
  explanation: DecisionExplanation;
  evaluatedAt: string;
}

export interface DecisionMetrics {
  totalDecisionsEvaluated: number;
  averageDecisionLatencyMs: number;
  averageConfidencePercent: number;
  totalPolicyViolationsCount: number;
  totalRejectedCount: number;
  decisionThroughputPerMin: number;
  averageCandidateCountPerRequest: number;
}

export interface DecisionEvent {
  id: string;
  type:
    | 'DecisionRequested'
    | 'ConstraintsEvaluated'
    | 'PoliciesValidated'
    | 'CandidatesRanked'
    | 'DecisionSelected'
    | 'DecisionRejected'
    | 'DecisionEscalated';
  requestId: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
