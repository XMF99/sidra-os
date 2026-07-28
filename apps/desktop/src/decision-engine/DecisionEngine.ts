import {
  DecisionRequest,
  DecisionResult,
  DecisionCandidate,
  ScoringWeights,
  CandidateScoreBreakdown,
  DecisionExplanation,
  DecisionMetrics,
  DecisionEvent,
  DecisionConstraint,
  DecisionPolicy,
} from './types';
import { ScoringEngine } from './ScoringEngine';
import { ConstraintEngine } from './ConstraintEngine';
import { PolicyEngine } from './PolicyEngine';
import { ExplanationEngine } from './ExplanationEngine';
import { DecisionRegistry } from './DecisionRegistry';
import { DecisionMetricsEngine } from './DecisionMetricsEngine';

export type DecisionEventListener = (event: DecisionEvent) => void;

export class DecisionEngine {
  private static instance: DecisionEngine;
  private registry = DecisionRegistry.getInstance();
  private metricsEngine = DecisionMetricsEngine.getInstance();
  private listeners = new Set<DecisionEventListener>();
  private eventLog: DecisionEvent[] = [];

  private constructor() {
    this.seedDefaultDecisions();
  }

  public static getInstance(): DecisionEngine {
    if (!DecisionEngine.instance) {
      DecisionEngine.instance = new DecisionEngine();
    }
    return DecisionEngine.instance;
  }

  public subscribe(listener: DecisionEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(type: DecisionEvent['type'], requestId: string, payload?: Record<string, unknown>): void {
    const event: DecisionEvent = {
      id: `EV-DEC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      requestId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    if (this.eventLog.length > 300) {
      this.eventLog.pop();
    }
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): DecisionEvent[] {
    return [...this.eventLog];
  }

  private seedDefaultDecisions(): void {
    const sampleRequest: DecisionRequest = {
      id: 'REQ-DEC-101',
      decisionType: 'connector_selection',
      requesterId: 'AGT-01',
      requesterType: 'agent',
      context: { task: 'Code Analysis & Security Review' },
      candidates: [
        {
          id: 'cand_openrouter',
          name: 'OpenRouter Claude 3.5 Sonnet',
          description: 'High intelligence LLM endpoint via OpenRouter connector',
          parameters: { model: 'anthropic/claude-3.5-sonnet' },
          estimatedCost: 0.015,
          estimatedRisk: 5,
          estimatedLatencyMs: 850,
          complexity: 3,
          confidence: 0.98,
          businessValue: 95,
        },
        {
          id: 'cand_local_llama',
          name: 'Local Ollama Llama-3 8B',
          description: 'Local offline LLM inference via Ollama connector',
          parameters: { model: 'llama3:8b' },
          estimatedCost: 0.0,
          estimatedRisk: 12,
          estimatedLatencyMs: 1200,
          complexity: 2,
          confidence: 0.88,
          businessValue: 80,
        },
      ],
      requestedAt: new Date().toISOString(),
    };

    this.requestDecision(sampleRequest);
  }

  // Public API: Request & Evaluate Decision
  public requestDecision(request: DecisionRequest): DecisionResult {
    const startTime = Date.now();
    this.emitEvent('DecisionRequested', request.id, { type: request.decisionType, requesterId: request.requesterId });

    // 1. Constraint Evaluation
    const activeConstraints = [...this.registry.getAllConstraints(), ...(request.customConstraints || [])];
    const constraintViolations = this.applyConstraints(request.candidates, activeConstraints);
    this.emitEvent('ConstraintsEvaluated', request.id, { constraintCount: activeConstraints.length });

    // 2. Policy Validation
    const activePolicies = this.registry.getActivePolicies();
    const policyViolations = this.applyPolicies(request.candidates, activePolicies);
    this.emitEvent('PoliciesValidated', request.id, { policyCount: activePolicies.length });

    // 3. Candidate Scoring & Ranking
    const breakdowns = this.rankCandidates(
      request.candidates,
      request.customWeights,
      constraintViolations,
      policyViolations
    );
    this.emitEvent('CandidatesRanked', request.id, { candidateCount: breakdowns.length });

    // 4. Winner Selection
    const validBreakdowns = breakdowns.filter((b) => b.passed);
    let selectedCandidate: DecisionCandidate | undefined;
    let status: DecisionResult['status'] = 'rejected';

    if (validBreakdowns.length > 0) {
      selectedCandidate = request.candidates.find((c) => c.id === validBreakdowns[0].candidateId);
      status = 'approved';
    } else if (breakdowns.length > 0 && breakdowns[0].rawScore > 30) {
      selectedCandidate = request.candidates.find((c) => c.id === breakdowns[0].candidateId);
      status = 'conditional';
    }

    // 5. Explanation Generation
    const explanation = this.generateExplanation(
      request,
      selectedCandidate,
      breakdowns,
      activeConstraints.length,
      activePolicies.length
    );

    const latency = Date.now() - startTime;
    this.metricsEngine.recordDecisionLatency(latency);

    const result: DecisionResult = {
      requestId: request.id,
      decisionType: request.decisionType,
      status,
      selectedCandidate,
      selectedCandidateId: selectedCandidate?.id,
      score: explanation.finalScore,
      confidence: explanation.confidence,
      explanation,
      evaluatedAt: new Date().toISOString(),
    };

    this.registry.addHistoryRecord(result);

    if (status === 'approved') {
      this.emitEvent('DecisionSelected', request.id, { selectedId: selectedCandidate?.id, score: result.score });
    } else {
      this.emitEvent('DecisionRejected', request.id, { rationale: explanation.rationale });
    }

    return result;
  }

  public applyConstraints(
    candidates: DecisionCandidate[],
    constraints: DecisionConstraint[]
  ): Map<string, string[]> {
    return ConstraintEngine.evaluateConstraints(candidates, constraints);
  }

  public applyPolicies(
    candidates: DecisionCandidate[],
    policies: DecisionPolicy[]
  ): Map<string, string[]> {
    return PolicyEngine.validatePolicies(candidates, policies);
  }

  public rankCandidates(
    candidates: DecisionCandidate[],
    customWeights?: Partial<ScoringWeights>,
    constraintViolations?: Map<string, string[]>,
    policyViolations?: Map<string, string[]>
  ): CandidateScoreBreakdown[] {
    return ScoringEngine.scoreCandidates(candidates, customWeights, constraintViolations, policyViolations);
  }

  public generateExplanation(
    request: DecisionRequest,
    selectedCandidate: DecisionCandidate | undefined,
    breakdowns: CandidateScoreBreakdown[],
    constraintsCount: number,
    policiesCount: number
  ): DecisionExplanation {
    return ExplanationEngine.generateExplanation(request, selectedCandidate, breakdowns, constraintsCount, policiesCount);
  }

  public replayDecision(requestId: string): DecisionResult | undefined {
    const history = this.registry.getHistory();
    return history.find((h) => h.requestId === requestId);
  }

  public getDecisionHistory(): DecisionResult[] {
    return this.registry.getHistory();
  }

  public getMetrics(): DecisionMetrics {
    return this.metricsEngine.getMetrics(this.registry.getHistory());
  }

  public getRegistry(): DecisionRegistry {
    return this.registry;
  }
}
