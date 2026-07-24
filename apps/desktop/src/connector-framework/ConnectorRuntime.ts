import { ConnectorEvent, ConnectorCapability } from './types';
import { ConnectorRegistry } from './ConnectorRegistry';
import { AuthManager } from './AuthManager';

export type ConnectorEventListener = (event: ConnectorEvent) => void;

export class ConnectorRuntime {
  private static instance: ConnectorRuntime;
  private registry = ConnectorRegistry.getInstance();
  private authManager = AuthManager.getInstance();
  private listeners = new Set<ConnectorEventListener>();
  private eventLog: ConnectorEvent[] = [];

  public static getInstance(): ConnectorRuntime {
    if (!ConnectorRuntime.instance) {
      ConnectorRuntime.instance = new ConnectorRuntime();
    }
    return ConnectorRuntime.instance;
  }

  public subscribe(listener: ConnectorEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(type: ConnectorEvent['type'], connectorId: string, payload?: Record<string, unknown>): void {
    const event: ConnectorEvent = {
      id: `EV-CN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      connectorId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): ConnectorEvent[] {
    return [...this.eventLog];
  }

  public async connectConnector(connectorId: string, credential?: string): Promise<boolean> {
    const conn = this.registry.get(connectorId);
    if (!conn) {
      throw new Error(`Connector '${connectorId}' not registered.`);
    }

    if (credential) {
      this.authManager.storeCredential(connectorId, credential);
    }

    const isValid = this.authManager.validateAuth(connectorId, conn.manifest.authType);
    if (!isValid) {
      conn.state = 'unauthorized';
      this.emitEvent('AuthFailed', connectorId, { authType: conn.manifest.authType });
      throw new Error(`Authentication failed for connector '${conn.manifest.name}'. Credentials missing.`);
    }

    const success = await conn.connect();
    if (success) {
      this.emitEvent('ConnectorConnected', connectorId, { name: conn.manifest.name });
    }
    return success;
  }

  public async disconnectConnector(connectorId: string): Promise<void> {
    const conn = this.registry.get(connectorId);
    if (conn) {
      await conn.disconnect();
      this.emitEvent('ConnectorDisconnected', connectorId);
    }
  }

  public async executeCapability(
    connectorId: string,
    capability: ConnectorCapability,
    payload: Record<string, unknown> = {}
  ): Promise<Record<string, unknown>> {
    const conn = this.registry.get(connectorId);
    if (!conn) {
      throw new Error(`Connector '${connectorId}' not found.`);
    }

    if (conn.state !== 'connected') {
      await this.connectConnector(connectorId);
    }

    const startTime = Date.now();
    const result = await conn.executeCapability(capability, payload);
    conn.latencyMs = Date.now() - startTime;

    this.emitEvent('CapabilityExecuted', connectorId, { capability, latencyMs: conn.latencyMs });
    return result;
  }

  public getRegistry(): ConnectorRegistry {
    return this.registry;
  }

  public getAuthManager(): AuthManager {
    return this.authManager;
  }
}
