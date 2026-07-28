export type PolicyType =
  | 'security'
  | 'permission'
  | 'execution'
  | 'planning'
  | 'mission'
  | 'resource'
  | 'connector'
  | 'ai_agent'
  | 'knowledge'
  | 'compliance'
  | 'audit'
  | 'developer';

export type PolicyResult =
  | 'allow'
  | 'deny'
  | 'require_approval'
  | 'require_review'
  | 'retry_later'
  | 'escalate'
  | 'conditional_allow';

export interface PolicyRule {
  id: string;
  name: string;
  condition: string; // JavaScript / expression representation
  action: PolicyResult;
  priority: number;
}

export interface PolicyDefinition {
  id: string;
  name: string;
  version: string;
  type: PolicyType;
  description: string;
  priority: number;
  rules: PolicyRule[];
  targetRuntime: string;
  active: boolean;
  parameters?: Record<string, unknown>;
}

export interface PolicyEvaluationContext {
  action: string;
  subjectId: string;
  targetId?: string;
  sourceRuntime: string;
  environment: Record<string, unknown>;
  parameters?: Record<string, unknown>;
}

export interface PolicyEvaluationResult {
  evaluationId: string;
  policyId: string;
  policyName: string;
  decision: PolicyResult;
  allowed: boolean;
  reason: string;
  explanation: string;
  matchedRules: string[];
  evaluatedAt: string;
  durationMs: number;
}

export interface PolicySimulationResult {
  simulationId: string;
  scenarioName: string;
  expectedResult: PolicyResult;
  actualResult: PolicyResult;
  matched: boolean;
  durationMs: number;
  evaluatedPoliciesCount: number;
}

export interface PolicyAuditEntry {
  id: string;
  evaluationId: string;
  policyId: string;
  policyType: PolicyType;
  result: PolicyResult;
  contextSummary: string;
  timestamp: string;
}

export interface PolicyMetrics {
  evaluationsPerSec: number;
  totalEvaluatedCount: number;
  allowedCount: number;
  deniedCount: number;
  approvalsRequiredCount: number;
  policyViolationsCount: number;
  averageEvaluationDurationMs: number;
  simulationCount: number;
  conflictCount: number;
  auditEntriesCount: number;
}

export interface PolicyEvent {
  id: string;
  type:
    | 'PolicyEvaluated'
    | 'PolicyCreated'
    | 'PolicyUpdated'
    | 'PolicySimulated'
    | 'PolicyViolationDetected'
    | 'ConflictResolved';
  policyId: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
