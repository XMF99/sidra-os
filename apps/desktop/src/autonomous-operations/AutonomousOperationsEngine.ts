import {
  RecommendationItem,
  RuntimeScoreboardEntry,
  LearningEvent,
  BaselineComparison,
  OperationsMetrics,
  OperationsEvent,
} from './types';
import { TrendAnalyzer } from './TrendAnalyzer';
import { RuntimeOptimizer } from './RuntimeOptimizer';
import { RecommendationEngine } from './RecommendationEngine';
import { LearningStore } from './LearningStore';
import { OperationsMetricsEngine } from './OperationsMetricsEngine';

export type OperationsEventListener = (event: OperationsEvent) => void;

export class AutonomousOperationsEngine {
  private static instance: AutonomousOperationsEngine;
  private recEngine = new RecommendationEngine();
  private learningStore = new LearningStore();
  private metricsEngine = new OperationsMetricsEngine();
  private listeners = new Set<OperationsEventListener>();
  private eventLog: OperationsEvent[] = [];

  private constructor() {}

  public static getInstance(): AutonomousOperationsEngine {
    if (!AutonomousOperationsEngine.instance) {
      AutonomousOperationsEngine.instance = new AutonomousOperationsEngine();
    }
    return AutonomousOperationsEngine.instance;
  }

  public subscribe(listener: OperationsEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(type: OperationsEvent['type'], targetRuntime?: string, payload?: Record<string, unknown>): void {
    const event: OperationsEvent = {
      id: `EV-OPS-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      targetRuntime,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    if (this.eventLog.length > 300) {
      this.eventLog.pop();
    }
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): OperationsEvent[] {
    return [...this.eventLog];
  }

  public analyze(): { scoreboard: RuntimeScoreboardEntry[]; baselines: BaselineComparison[] } {
    const scoreboard = TrendAnalyzer.generateScoreboard();
    const baselines = TrendAnalyzer.compareBaseline();
    this.emitEvent('AnalysisCompleted', 'all', { scoreboardCount: scoreboard.length });
    return { scoreboard, baselines };
  }

  public recommend(): RecommendationItem[] {
    const recs = this.recEngine.generateRecommendations();
    this.emitEvent('RecommendationGenerated', 'all', { count: recs.length });
    return recs;
  }

  public optimize(targetRuntime = 'all'): { success: boolean; actionsTaken: string[]; impactSummary: string } {
    const res = RuntimeOptimizer.executeOptimization(targetRuntime);
    this.metricsEngine.recordOptimization();
    this.learningStore.recordLearning(`Automated optimization executed for runtime '${targetRuntime}'.`, 'OptimizationExecuted', 95);
    this.emitEvent('OptimizationApplied', targetRuntime, { actionsCount: res.actionsTaken.length });
    return res;
  }

  public applyRecommendation(id: string): RecommendationItem | undefined {
    const item = this.recEngine.applyRecommendation(id);
    if (item) {
      this.metricsEngine.recordAcceptance();
      this.optimize(item.targetRuntime);
    }
    return item;
  }

  public dismissRecommendation(id: string): RecommendationItem | undefined {
    return this.recEngine.dismissRecommendation(id);
  }

  public learn(lessonLearned: string, eventType = 'InsightRecorded', confidence = 90): LearningEvent {
    const event = this.learningStore.recordLearning(lessonLearned, eventType, confidence);
    this.emitEvent('LearningRecorded', undefined, { lessonId: event.id });
    return event;
  }

  public compareBaseline(): BaselineComparison[] {
    return TrendAnalyzer.compareBaseline();
  }

  public getRecommendations(): RecommendationItem[] {
    return this.recEngine.getAllRecommendations();
  }

  public getInsights(): LearningEvent[] {
    return this.learningStore.getInsights();
  }

  public getMetrics(): OperationsMetrics {
    return this.metricsEngine.getMetrics(this.learningStore.getInsights().length);
  }
}
