import { AutomationMetrics } from './types';

export class AutomationMetricsEngine {
  private static instance: AutomationMetricsEngine;
  private totalExecutions = 0;
  private successfulExecutions = 0;
  private failedExecutions = 0;
  private totalDurationMs = 0;
  private lastExecutionTime?: string;

  public static getInstance(): AutomationMetricsEngine {
    if (!AutomationMetricsEngine.instance) {
      AutomationMetricsEngine.instance = new AutomationMetricsEngine();
    }
    return AutomationMetricsEngine.instance;
  }

  public recordExecution(success: boolean, durationMs: number): void {
    this.totalExecutions += 1;
    if (success) {
      this.successfulExecutions += 1;
    } else {
      this.failedExecutions += 1;
    }
    this.totalDurationMs += durationMs;
    this.lastExecutionTime = new Date().toISOString();
  }

  public getMetrics(totalAutomations: number, activeAutomations: number, queuedJobsCount: number): AutomationMetrics {
    const avgDuration =
      this.totalExecutions > 0 ? Math.round(this.totalDurationMs / this.totalExecutions) : 0;

    return {
      totalAutomations,
      activeAutomations,
      totalExecutions: this.totalExecutions,
      successfulExecutions: this.successfulExecutions,
      failedExecutions: this.failedExecutions,
      queuedJobsCount,
      averageExecutionDurationMs: avgDuration,
      lastExecutionTime: this.lastExecutionTime,
    };
  }
}
