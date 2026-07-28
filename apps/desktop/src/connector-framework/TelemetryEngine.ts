import { ConnectorMetrics } from './types';

export class TelemetryEngine {
  private static instance: TelemetryEngine;
  private metricsMap = new Map<string, ConnectorMetrics>();
  private logs: Array<{ connectorId: string; level: 'info' | 'warn' | 'error'; message: string; timestamp: string }> = [];

  public static getInstance(): TelemetryEngine {
    if (!TelemetryEngine.instance) {
      TelemetryEngine.instance = new TelemetryEngine();
    }
    return TelemetryEngine.instance;
  }

  public getMetrics(connectorId: string): ConnectorMetrics {
    let m = this.metricsMap.get(connectorId);
    if (!m) {
      m = {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        rateLimitHits: 0,
        averageLatencyMs: 0,
      };
      this.metricsMap.set(connectorId, m);
    }
    return m;
  }

  public recordExecution(connectorId: string, success: boolean, latencyMs: number): void {
    const m = this.getMetrics(connectorId);
    m.totalExecutions += 1;
    if (success) {
      m.successfulExecutions += 1;
    } else {
      m.failedExecutions += 1;
    }

    m.averageLatencyMs = Math.round(
      (m.averageLatencyMs * (m.totalExecutions - 1) + latencyMs) / m.totalExecutions
    );
    m.lastExecutionTime = new Date().toISOString();
  }

  public recordRateLimitHit(connectorId: string): void {
    const m = this.getMetrics(connectorId);
    m.rateLimitHits += 1;
  }

  public log(connectorId: string, level: 'info' | 'warn' | 'error', message: string): void {
    this.logs.unshift({
      connectorId,
      level,
      message,
      timestamp: new Date().toISOString(),
    });
    if (this.logs.length > 500) {
      this.logs.pop();
    }
  }

  public getLogs(connectorId?: string): Array<{ connectorId: string; level: 'info' | 'warn' | 'error'; message: string; timestamp: string }> {
    if (connectorId) {
      return this.logs.filter((l) => l.connectorId === connectorId);
    }
    return [...this.logs];
  }
}
