import { AgentModel } from './types';

export class HeartbeatMonitor {
  private lastHeartbeatMap = new Map<string, number>();

  public recordHeartbeat(agent: AgentModel): void {
    const now = Date.now();
    this.lastHeartbeatMap.set(agent.id, now);
    agent.lastHeartbeatAt = new Date(now).toISOString();
    agent.uptimeSeconds += 5;
    agent.health = 'healthy';
  }

  public checkHealth(agent: AgentModel, timeoutMs = 30000): void {
    const last = this.lastHeartbeatMap.get(agent.id);
    if (!last) return;

    const diff = Date.now() - last;
    if (diff > timeoutMs * 2) {
      agent.health = 'unresponsive';
    } else if (diff > timeoutMs) {
      agent.health = 'degraded';
    } else {
      agent.health = 'healthy';
    }
  }
}
