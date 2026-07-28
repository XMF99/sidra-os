import { DecisionPolicy, DecisionConstraint, DecisionResult } from './types';

export class DecisionRegistry {
  private static instance: DecisionRegistry;
  private policies = new Map<string, DecisionPolicy>();
  private constraints = new Map<string, DecisionConstraint>();
  private history: DecisionResult[] = [];

  private constructor() {
    this.seedDefaultPoliciesAndConstraints();
  }

  public static getInstance(): DecisionRegistry {
    if (!DecisionRegistry.instance) {
      DecisionRegistry.instance = new DecisionRegistry();
    }
    return DecisionRegistry.instance;
  }

  private seedDefaultPoliciesAndConstraints(): void {
    const p1: DecisionPolicy = {
      id: 'pol_security_baseline',
      name: 'Security Perimeter Baseline',
      category: 'security',
      description: 'Requires minimum confidence of 0.70 and disallows high risk options (>60%).',
      active: true,
      minConfidence: 0.7,
      disallowHighRisk: true,
    };

    const p2: DecisionPolicy = {
      id: 'pol_budget_guardrail',
      name: 'Corporate Budget Guardrail',
      category: 'organization',
      description: 'Restricts unapproved spending exceeding budget parameters.',
      active: true,
      minConfidence: 0.6,
      disallowHighRisk: false,
    };

    this.policies.set(p1.id, p1);
    this.policies.set(p2.id, p2);

    const c1: DecisionConstraint = {
      id: 'cons_budget_max',
      name: 'Max Single Transaction Budget',
      type: 'budget',
      description: 'Maximum allowable cost per automated decision is $50.00',
      maxCost: 50.0,
    };

    const c2: DecisionConstraint = {
      id: 'cons_latency_max',
      name: 'Max SLA Latency Limit',
      type: 'time',
      description: 'Maximum allowable latency limit is 2500ms',
      maxLatencyMs: 2500,
    };

    this.constraints.set(c1.id, c1);
    this.constraints.set(c2.id, c2);
  }

  public getActivePolicies(): DecisionPolicy[] {
    return Array.from(this.policies.values()).filter((p) => p.active);
  }

  public getAllPolicies(): DecisionPolicy[] {
    return Array.from(this.policies.values());
  }

  public getAllConstraints(): DecisionConstraint[] {
    return Array.from(this.constraints.values());
  }

  public addHistoryRecord(result: DecisionResult): void {
    this.history.unshift(result);
    if (this.history.length > 200) {
      this.history.pop();
    }
  }

  public getHistory(): DecisionResult[] {
    return [...this.history];
  }
}
