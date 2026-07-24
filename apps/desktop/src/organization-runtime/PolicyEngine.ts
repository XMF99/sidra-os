import { PolicyRule } from './types';

export class PolicyEngine {
  private static instance: PolicyEngine;
  private policies = new Map<string, PolicyRule>();

  private constructor() {
    this.registerDefaultPolicies();
  }

  public static getInstance(): PolicyEngine {
    if (!PolicyEngine.instance) {
      PolicyEngine.instance = new PolicyEngine();
    }
    return PolicyEngine.instance;
  }

  private registerDefaultPolicies(): void {
    const budgetPolicy: PolicyRule = {
      id: 'pol_budget_ceiling',
      name: 'High Spend Approval Requirement',
      category: 'Budget',
      ruleExpression: 'spendUSD > 1000',
      action: 'require_approval',
    };
    const securityPolicy: PolicyRule = {
      id: 'pol_gateway_enforcement',
      name: 'Mandatory Model Gateway Routing',
      category: 'Security',
      ruleExpression: 'directModelCall === true',
      action: 'deny',
    };

    [budgetPolicy, securityPolicy].forEach((p) => this.register(p));
  }

  public register(rule: PolicyRule): void {
    this.policies.set(rule.id, rule);
  }

  public evaluate(category: string, context: Record<string, unknown>): 'allow' | 'deny' | 'require_approval' {
    const categoryRules = Array.from(this.policies.values()).filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );

    for (const rule of categoryRules) {
      try {
        const result = Boolean(new Function('context', `return context.${rule.ruleExpression}`)(context));
        if (result) {
          return rule.action;
        }
      } catch {
        // Fallthrough if expression evaluation fails
      }
    }

    return 'allow';
  }

  public getAll(): PolicyRule[] {
    return Array.from(this.policies.values());
  }
}
