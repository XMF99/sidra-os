import {
  PolicyDefinition,
  PolicyEvaluationContext,
  PolicyEvaluationResult,
  PolicySimulationResult,
  PolicyAuditEntry,
  PolicyMetrics,
  PolicyEvent,
  PolicyResult,
} from './types';
import { PolicyRegistry } from './PolicyRegistry';
import { RuleEvaluator } from './RuleEvaluator';
import { PolicySimulator } from './PolicySimulator';
import { ExplanationAuditEngine } from './ExplanationAuditEngine';
import { PolicyMetricsEngine } from './PolicyMetricsEngine';

export type PolicyEventListener = (event: PolicyEvent) => void;

export class PolicyGovernanceEngine {
  private static instance: PolicyGovernanceEngine;
  private registry = PolicyRegistry.getInstance();
  private auditEngine = new ExplanationAuditEngine();
  private metricsEngine = new PolicyMetricsEngine();
  private listeners = new Set<PolicyEventListener>();
  private eventLog: PolicyEvent[] = [];

  private constructor() {}

  public static getInstance(): PolicyGovernanceEngine {
    if (!PolicyGovernanceEngine.instance) {
      PolicyGovernanceEngine.instance = new PolicyGovernanceEngine();
    }
    return PolicyGovernanceEngine.instance;
  }

  public subscribe(listener: PolicyEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(type: PolicyEvent['type'], policyId: string, payload?: Record<string, unknown>): void {
    const event: PolicyEvent = {
      id: `EV-POL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      policyId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    if (this.eventLog.length > 300) {
      this.eventLog.pop();
    }
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): PolicyEvent[] {
    return [...this.eventLog];
  }

  public evaluate(context: PolicyEvaluationContext): PolicyEvaluationResult {
    const activePolicies = this.registry.getAllPolicies().filter((p) => p.active);
    let finalResult: PolicyEvaluationResult | null = null;

    // Evaluate in priority order
    activePolicies.sort((a, b) => b.priority - a.priority);

    for (const policy of activePolicies) {
      const res = RuleEvaluator.evaluatePolicy(policy, context);
      if (!res.allowed || res.decision !== 'allow') {
        finalResult = res;
        break; // Short-circuit on first non-allow decision
      }
      if (!finalResult) {
        finalResult = res;
      }
    }

    if (!finalResult) {
      const defaultPolicy = activePolicies[0];
      finalResult = RuleEvaluator.evaluatePolicy(defaultPolicy, context);
    }

    const matchedPolicy = activePolicies.find((p) => p.id === finalResult!.policyId) || activePolicies[0];
    this.auditEngine.logEvaluation(finalResult, matchedPolicy.type);
    this.metricsEngine.recordEvaluation(finalResult);

    this.emitEvent('PolicyEvaluated', finalResult.policyId, { decision: finalResult.decision, action: context.action });

    if (finalResult.decision === 'deny') {
      this.emitEvent('PolicyViolationDetected', finalResult.policyId, { reason: finalResult.reason });
    }

    return finalResult;
  }

  public simulate(
    scenarioName: string,
    policyIds: string[],
    context: PolicyEvaluationContext,
    expectedResult: PolicyResult
  ): PolicySimulationResult {
    const policies = policyIds.length > 0
      ? policyIds.map((id) => this.registry.getPolicy(id)).filter(Boolean) as PolicyDefinition[]
      : this.registry.getAllPolicies();

    const simRes = PolicySimulator.simulateScenario(scenarioName, policies, context, expectedResult);
    this.metricsEngine.recordSimulation();
    this.emitEvent('PolicySimulated', policies[0]?.id || 'all', { scenarioName, matched: simRes.matched });

    return simRes;
  }

  public validatePolicy(policy: PolicyDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!policy.id) errors.push('Policy ID is required.');
    if (!policy.name) errors.push('Policy Name is required.');
    if (!policy.rules || policy.rules.length === 0) errors.push('Policy must contain at least one rule.');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public explainDecision(result: PolicyEvaluationResult): string {
    return this.auditEngine.explainDecision(result);
  }

  public getAuditTrail(): PolicyAuditEntry[] {
    return this.auditEngine.getAuditTrail();
  }

  public getPolicy(id: string): PolicyDefinition | undefined {
    return this.registry.getPolicy(id);
  }

  public getPolicies(): PolicyDefinition[] {
    return this.registry.getAllPolicies();
  }

  public getMetrics(): PolicyMetrics {
    return this.metricsEngine.getMetrics(this.auditEngine.getAuditTrail().length);
  }

  public getRegistry(): PolicyRegistry {
    return this.registry;
  }
}
