import { WorkflowMetrics } from './types';

export class WorkflowMetricsEngine {
  private static instance: WorkflowMetricsEngine;
  private totalInstances = 0;
  private completedInstances = 0;
  private failedInstances = 0;
  private compensationsCount = 0;
  private totalDurationMs = 0;

  public static getInstance(): WorkflowMetricsEngine {
    if (!WorkflowMetricsEngine.instance) {
      WorkflowMetricsEngine.instance = new WorkflowMetricsEngine();
    }
    return WorkflowMetricsEngine.instance;
  }

  public recordInstanceStarted(): void {
    this.totalInstances += 1;
  }

  public recordInstanceCompleted(durationMs: number): void {
    this.completedInstances += 1;
    this.totalDurationMs += durationMs;
  }

  public recordInstanceFailed(): void {
    this.failedInstances += 1;
  }

  public recordCompensation(): void {
    this.compensationsCount += 1;
  }

  public getMetrics(
    totalDefinitions: number,
    activeInstances: number,
    pendingApprovalsCount: number
  ): WorkflowMetrics {
    const avgDuration =
      this.completedInstances > 0 ? Math.round(this.totalDurationMs / this.completedInstances) : 0;

    return {
      totalDefinitions,
      totalInstances: this.totalInstances,
      activeInstances,
      completedInstances: this.completedInstances,
      failedInstances: this.failedInstances,
      pendingApprovalsCount,
      compensationsCount: this.compensationsCount,
      averageDurationMs: avgDuration,
    };
  }
}
