import { PolicyAuditEntry, PolicyEvaluationResult, PolicyType } from './types';

export class ExplanationAuditEngine {
  private auditEntries: PolicyAuditEntry[] = [];

  public logEvaluation(res: PolicyEvaluationResult, policyType: PolicyType): PolicyAuditEntry {
    const entry: PolicyAuditEntry = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      evaluationId: res.evaluationId,
      policyId: res.policyId,
      policyType,
      result: res.decision,
      contextSummary: res.reason,
      timestamp: res.evaluatedAt,
    };

    this.auditEntries.unshift(entry);
    if (this.auditEntries.length > 1000) {
      this.auditEntries.pop();
    }

    return entry;
  }

  public getAuditTrail(): PolicyAuditEntry[] {
    return [...this.auditEntries];
  }

  public explainDecision(res: PolicyEvaluationResult): string {
    return `[Policy Governance Decision]: ${res.decision.toUpperCase()}\nPolicy: ${res.policyName} (${res.policyId})\nReason: ${res.reason}\nMatched Rules: ${res.matchedRules.join(', ') || 'Default'}\nTimestamp: ${res.evaluatedAt}`;
  }
}
