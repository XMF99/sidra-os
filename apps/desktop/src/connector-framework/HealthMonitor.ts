import { ConnectorRegistry } from './ConnectorRegistry';
import { TelemetryEngine } from './TelemetryEngine';

export class HealthMonitor {
  private static instance: HealthMonitor;
  private registry = ConnectorRegistry.getInstance();
  private telemetry = TelemetryEngine.getInstance();

  public static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  public async runHealthCheckAll(): Promise<Record<string, 'healthy' | 'degraded' | 'failed'>> {
    const results: Record<string, 'healthy' | 'degraded' | 'failed'> = {};
    const connectors = this.registry.getAll();

    for (const conn of connectors) {
      const status = await conn.checkHealth();
      results[conn.manifest.id] = status;
      this.telemetry.log(conn.manifest.id, 'info', `Health check completed: status = ${status}`);
    }

    return results;
  }
}
