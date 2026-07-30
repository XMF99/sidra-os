import { describe, it, expect } from 'vitest';
import { useCognitiveEngineStore } from '../useCognitiveEngineStore';

describe('useCognitiveEngineStore', () => {
  it('manages Adaptive Cognitive Modes and manual override toggle', () => {
    const store = useCognitiveEngineStore.getState();
    expect(store.activeMode).toBe('Strategic');

    store.setActiveMode('Analytical', true);
    expect(useCognitiveEngineStore.getState().activeMode).toBe('Analytical');
    expect(useCognitiveEngineStore.getState().manualOverride).toBe(true);
  });

  it('runs Meta Reasoning self-audit prior to decision execution', () => {
    const store = useCognitiveEngineStore.getState();
    const audit = store.runMetaReasoningAudit();

    expect(audit.logicConsistencyScore).toBeGreaterThanOrEqual(95);
    expect(audit.evidenceCoverageScore).toBeGreaterThanOrEqual(90);
    expect(audit.weakAssumptionsDetected.length).toBeGreaterThan(0);
  });

  it('evaluates multi-perspective executive viewpoints', () => {
    const store = useCognitiveEngineStore.getState();
    expect(store.perspectives.length).toBeGreaterThanOrEqual(4);

    const ceoView = store.perspectives.find((p) => p.role === 'CEO');
    expect(ceoView).toBeDefined();
    expect(ceoView?.confidence).toBeGreaterThan(90);
  });

  it('tracks assumptions and post-execution reflection logs', () => {
    const store = useCognitiveEngineStore.getState();
    const initialAssumptions = store.assumptions.length;

    store.addAssumption({
      statement: 'Sub-agent task DAG latency < 10ms',
      source: 'Tokio Benchmark',
      evidenceRating: 'Strong',
      confidence: 98,
      impactLevel: 'High',
    });

    expect(useCognitiveEngineStore.getState().assumptions.length).toBe(initialAssumptions + 1);

    store.recordReflection({
      actionTitle: 'Deploy Game Studio Engine',
      expectedOutcome: 'Zero build errors',
      actualOutcome: 'Clean build in 6.1s',
      success: true,
      lessonsLearned: 'Vite code-splitting optimized bundle load time.',
    });

    expect(useCognitiveEngineStore.getState().reflections.length).toBeGreaterThan(0);
  });

  it('monitors uncertainty and goal alignment metrics', () => {
    const store = useCognitiveEngineStore.getState();
    expect(store.uncertainty.confidenceRating).toBeGreaterThanOrEqual(95);
    expect(store.goalAlignmentScore).toBeGreaterThanOrEqual(98);
  });
});
