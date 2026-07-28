import { PolicyDefinition } from './types';

export class PolicyRegistry {
  private static instance: PolicyRegistry;
  private policies = new Map<string, PolicyDefinition>();

  private constructor() {
    this.seedDefaultPolicies();
  }

  public static getInstance(): PolicyRegistry {
    if (!PolicyRegistry.instance) {
      PolicyRegistry.instance = new PolicyRegistry();
    }
    return PolicyRegistry.instance;
  }

  private seedDefaultPolicies(): void {
    const defaults: PolicyDefinition[] = [
      {
        id: 'pol_sec_auth',
        name: 'Local-First Security & Sandbox Policy',
        version: '1.0.0',
        type: 'security',
        description: 'Requires explicit sandbox isolation and permission verification before executing shell commands',
        priority: 100,
        targetRuntime: 'all',
        active: true,
        rules: [
          { id: 'rule_sec_1', name: 'Deny Untrusted Direct Shell Execution', condition: "action == 'unsafe_exec'", action: 'deny', priority: 10 },
          { id: 'rule_sec_2', name: 'Allow Standard Sandboxed Operations', condition: '*', action: 'allow', priority: 1 },
        ],
      },
      {
        id: 'pol_budget_limit',
        name: 'Enterprise Financial Budget Policy',
        version: '1.2.0',
        type: 'permission',
        description: 'Enforces human approval when single execution spend exceeds threshold ($100 USD)',
        priority: 90,
        targetRuntime: 'mission',
        active: true,
        rules: [
          { id: 'rule_bud_1', name: 'Require Approval for High Budget Spend', condition: 'spendUSD > 100', action: 'require_approval', priority: 10 },
          { id: 'rule_bud_2', name: 'Allow Low Spend Executions', condition: '*', action: 'allow', priority: 1 },
        ],
      },
      {
        id: 'pol_ai_agent_governance',
        name: 'Autonomous AI Agent Execution Policy',
        version: '2.0.0',
        type: 'ai_agent',
        description: 'Governs AI agent autonomy bounds, requiring review for code refactoring on core engine crates',
        priority: 85,
        targetRuntime: 'agent',
        active: true,
        rules: [
          { id: 'rule_ag_1', name: 'Require Review for Engine Crate Refactoring', condition: "action == 'modify_core_kernel'", action: 'require_review', priority: 10 },
          { id: 'rule_ag_2', name: 'Allow Standard Agent Task Execution', condition: '*', action: 'allow', priority: 1 },
        ],
      },
      {
        id: 'pol_resource_quota',
        name: 'Resource Pool Quota & Overload Policy',
        version: '1.1.0',
        type: 'resource',
        description: 'Prevents system resource exhaustion by throttling execution requests when pool capacity drops below 10%',
        priority: 80,
        targetRuntime: 'resource',
        active: true,
        rules: [
          { id: 'rule_res_1', name: 'Retry Later on Resource Saturation', condition: "action == 'resource_overload'", action: 'retry_later', priority: 10 },
          { id: 'rule_res_2', name: 'Allow Normal Allocation', condition: '*', action: 'allow', priority: 1 },
        ],
      },
    ];

    defaults.forEach((p) => this.policies.set(p.id, p));
  }

  public registerPolicy(policy: PolicyDefinition): void {
    this.policies.set(policy.id, policy);
  }

  public getPolicy(id: string): PolicyDefinition | undefined {
    return this.policies.get(id);
  }

  public getAllPolicies(): PolicyDefinition[] {
    return Array.from(this.policies.values());
  }

  public getPoliciesByType(type: string): PolicyDefinition[] {
    return Array.from(this.policies.values()).filter((p) => p.type === type);
  }
}
