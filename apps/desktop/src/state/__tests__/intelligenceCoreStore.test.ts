import { describe, it, expect } from 'vitest';
import { useIntelligenceCoreStore } from '../useIntelligenceCoreStore';

describe('useIntelligenceCoreStore', () => {
  it('manages Organization DNA Profile preferences', () => {
    const store = useIntelligenceCoreStore.getState();
    expect(store.dna.orgName).toContain('Sidra');
    expect(store.dna.growthStage).toBe('Enterprise');

    store.updateGovernanceSettings({ riskTolerance: 'Conservative' });
    expect(useIntelligenceCoreStore.getState().dna.riskTolerance).toBe('Conservative');
  });

  it('queries Living Organization Memory index', () => {
    const store = useIntelligenceCoreStore.getState();
    expect(store.memories.length).toBeGreaterThan(0);

    store.addMemoryRecord({
      category: 'Lesson Learned',
      title: 'Tokio Async Queue Throughput',
      summary: 'Achieved 120k ops/sec task scheduling throughput.',
      tags: ['Performance', 'Tokio'],
      impactLevel: 'High',
    });

    const memories = useIntelligenceCoreStore.getState().memories;
    expect(memories.some((m) => m.title === 'Tokio Async Queue Throughput')).toBe(true);
  });

  it('traverses Knowledge Graph nodes and edges', () => {
    const store = useIntelligenceCoreStore.getState();
    expect(store.nodes.length).toBeGreaterThan(0);
    expect(store.edges.length).toBeGreaterThan(0);
    const engSpace = store.nodes.find((n) => n.label === 'Engineering Space');
    expect(engSpace).toBeDefined();
  });

  it('runs Reasoning Layer pipeline and evaluates confidence', () => {
    const store = useIntelligenceCoreStore.getState();
    const trace = store.runReasoningPipeline('Provision Game Studio Workspace');

    expect(trace.confidence).toBeGreaterThanOrEqual(90);
    expect(trace.memoryMatches.length).toBeGreaterThan(0);
    expect(trace.decisionPlan).toContain('DNA policies');
  });

  it('records decisions in Decision Journal and triggers Explainability drawer', () => {
    const store = useIntelligenceCoreStore.getState();
    const initialDecisions = store.decisions.length;

    store.recordDecision({
      title: 'Adopt Vault Event Sourcing',
      intent: 'Audit compliance',
      reason: '100% security token verification',
      alternativesEvaluated: ['Direct SQLite Mutations'],
      confidenceScore: 99,
      riskMatrix: [{ risk: 'Event Log Size Growth', severity: 'Low' }],
      result: 'Success',
    });

    expect(useIntelligenceCoreStore.getState().decisions.length).toBe(initialCount(initialDecisions));

    store.openExplainability({
      itemId: 'dec-test',
      title: 'Test Decision',
      whyChosen: 'Optimal security posture',
      whyNotAlternatives: ['Higher risk of data leakage'],
      howExecuted: 'Executed by Decision Engine',
      expectedBenefits: ['Data sovereignty'],
      potentialRisks: ['Latency overhead'],
      dependencies: ['Vault'],
      confidenceScore: 99,
    });

    expect(useIntelligenceCoreStore.getState().activeExplanation?.title).toBe('Test Decision');
    store.closeExplainability();
    expect(useIntelligenceCoreStore.getState().activeExplanation).toBeNull();
  });
});

function initialCount(c: number): number {
  return c + 1;
}
