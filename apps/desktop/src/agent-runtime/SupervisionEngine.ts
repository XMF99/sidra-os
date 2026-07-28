import { AgentModel, AgentSupervisionPolicy } from './types';

export class SupervisionEngine {
  private static instance: SupervisionEngine;
  private policy: AgentSupervisionPolicy = {
    heartbeatIntervalMs: 5000,
    timeoutThresholdMs: 15000,
    autoRecoveryEnabled: true,
    maxConsecutiveFailures: 3,
  };

  public static getInstance(): SupervisionEngine {
    if (!SupervisionEngine.instance) {
      SupervisionEngine.instance = new SupervisionEngine();
    }
    return SupervisionEngine.instance;
  }

  public auditAgentHealth(agent: AgentModel): 'healthy' | 'degraded' | 'unresponsive' | 'failed' {
    const lastHeartbeat = new Date(agent.lastHeartbeatAt).getTime();
    const elapsed = Date.now() - lastHeartbeat;

    if (elapsed > this.policy.timeoutThresholdMs * 2) {
      agent.health = 'failed';
      return 'failed';
    } else if (elapsed > this.policy.timeoutThresholdMs) {
      agent.health = 'unresponsive';
      return 'unresponsive';
    } else if (elapsed > this.policy.heartbeatIntervalMs * 2) {
      agent.health = 'degraded';
      return 'degraded';
    }

    agent.health = 'healthy';
    return 'healthy';
  }

  public attemptAutoRecovery(agent: AgentModel, onRecovered: () => void): boolean {
    if (this.policy.autoRecoveryEnabled && (agent.health === 'unresponsive' || agent.health === 'failed')) {
      agent.health = 'healthy';
      agent.lastHeartbeatAt = new Date().toISOString();
      onRecovered();
      return true;
    }
    return false;
  }
}
