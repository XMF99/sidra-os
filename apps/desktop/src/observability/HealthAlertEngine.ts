import { RuntimeHealthReport, TelemetryAlert, SystemHealthState } from './types';

export class HealthAlertEngine {
  private healthReports = new Map<string, RuntimeHealthReport>();
  private alerts: TelemetryAlert[] = [];

  constructor() {
    this.seedDefaultRuntimes();
  }

  private seedDefaultRuntimes(): void {
    const runtimes: Array<{ id: string; name: string }> = [
      { id: 'mission', name: 'Mission Runtime' },
      { id: 'workflow', name: 'Workflow Runtime' },
      { id: 'automation', name: 'Automation Runtime' },
      { id: 'agent', name: 'Agent Runtime' },
      { id: 'knowledge', name: 'Knowledge Runtime' },
      { id: 'decision', name: 'Decision Engine' },
      { id: 'planning', name: 'Planning Engine' },
      { id: 'execution', name: 'Execution Coordination Engine' },
      { id: 'resource', name: 'Resource & Capacity Engine' },
      { id: 'eventbus', name: 'Event Bus Engine' },
    ];

    const now = new Date().toISOString();
    runtimes.forEach((rt) => {
      this.healthReports.set(rt.id, {
        runtimeId: rt.id,
        runtimeName: rt.name,
        status: 'healthy',
        latencyMs: Math.floor(10 + Math.random() * 25),
        errorCount: 0,
        heartbeatAt: now,
        uptimePercent: 99.99,
      });
    });
  }

  public recordHeartbeat(runtimeId: string, latencyMs: number, status: SystemHealthState = 'healthy'): void {
    const report = this.healthReports.get(runtimeId);
    if (report) {
      report.heartbeatAt = new Date().toISOString();
      report.latencyMs = latencyMs;
      report.status = status;
    }
  }

  public triggerAlert(ruleName: string, sourceRuntime: string, message: string, severity: TelemetryAlert['severity'] = 'warning'): TelemetryAlert {
    const alert: TelemetryAlert = {
      id: `ALT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ruleName,
      severity,
      sourceRuntime,
      message,
      triggeredAt: new Date().toISOString(),
      active: true,
    };
    this.alerts.unshift(alert);
    return alert;
  }

  public resolveAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.active = false;
      alert.resolvedAt = new Date().toISOString();
    }
  }

  public getOverallHealth(): SystemHealthState {
    const reports = Array.from(this.healthReports.values());
    if (reports.some((r) => r.status === 'critical')) return 'critical';
    if (reports.some((r) => r.status === 'degraded')) return 'degraded';
    if (reports.some((r) => r.status === 'warning')) return 'warning';
    return 'healthy';
  }

  public getAllReports(): RuntimeHealthReport[] {
    return Array.from(this.healthReports.values());
  }

  public getActiveAlerts(): TelemetryAlert[] {
    return this.alerts.filter((a) => a.active);
  }

  public getAllAlerts(): TelemetryAlert[] {
    return [...this.alerts];
  }
}
